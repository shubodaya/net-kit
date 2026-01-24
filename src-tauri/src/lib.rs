use base64::engine::general_purpose::STANDARD;
use base64::Engine;
use printpdf::{BuiltinFont, Mm, PdfDocument};
use reqwest::{Client, Method, Url};
use serde::{Deserialize, Serialize};
use tauri::async_runtime;
use tauri::Emitter;
use std::collections::HashSet;
use std::io::BufWriter;
use std::net::{IpAddr, SocketAddr, TcpStream, ToSocketAddrs};
use std::process::Command;
use std::str::FromStr;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Clone, Debug, Serialize, Deserialize)]
struct WifiNetwork {
  ssid: String,
  security: String,
  signal: Option<i32>,
  frequency: Option<i32>,
  channel: Option<i32>,
}

#[derive(Debug, Serialize)]
struct WifiScanResponse {
  ok: bool,
  timestamp: u64,
  networks: Vec<WifiNetwork>,
  connected_ssid: Option<String>,
}

#[derive(Debug, Deserialize)]
struct WifiReportPayload {
  title: Option<String>,
  networks: Vec<WifiNetwork>,
}

#[derive(Clone, Debug, Serialize)]
struct IpDevice {
  ip: String,
  mac: String,
  hostname: String,
  vendor: String,
}

#[derive(Debug, Serialize)]
struct IpScanResponse {
  ok: bool,
  devices: Vec<IpDevice>,
}

#[derive(Clone, Debug, Serialize)]
struct IpScanProgress {
  percent: u32,
}

#[derive(Clone, Debug, Serialize)]
struct IpScanDone {
  count: usize,
}

#[derive(Debug, Serialize)]
struct PortScanResponse {
  ok: bool,
}

#[derive(Clone, Debug, Serialize)]
struct PortScanProgress {
  percent: u32,
}

#[derive(Clone, Debug, Serialize)]
struct PortScanDone {
  count: usize,
}

#[derive(Clone, Debug, Serialize)]
struct PortScanHit {
  port: u16,
}

#[derive(Debug, Serialize)]
struct TerminalResult {
  output: String,
  exit_code: i32,
}

#[derive(Debug, Serialize)]
struct ProxyResponse {
  status: u16,
  reason: String,
  headers: Vec<(String, String)>,
  body: String,
}

static IP_SCAN_RUNNING: AtomicBool = AtomicBool::new(false);
static IP_SCAN_CANCEL: AtomicBool = AtomicBool::new(false);
static PORT_SCAN_RUNNING: AtomicBool = AtomicBool::new(false);
static PORT_SCAN_CANCEL: AtomicBool = AtomicBool::new(false);

fn unix_timestamp() -> u64 {
  SystemTime::now()
    .duration_since(UNIX_EPOCH)
    .unwrap_or_default()
    .as_secs()
}

fn channel_to_frequency(channel: i32) -> Option<i32> {
  if channel <= 0 {
    None
  } else if channel <= 14 {
    Some(2407 + channel * 5)
  } else {
    Some(5000 + channel * 5)
  }
}

fn frequency_to_channel(freq: i32) -> Option<i32> {
  if freq == 2484 {
    return Some(14);
  }
  if (2412..=2472).contains(&freq) {
    return Some((freq - 2407) / 5);
  }
  if (5000..=5900).contains(&freq) {
    return Some((freq - 5000) / 5);
  }
  None
}

fn parse_cidr(subnet: &str) -> Result<(u32, u32), String> {
  let parts: Vec<&str> = subnet.split('/').collect();
  if parts.len() != 2 {
    return Err("Invalid CIDR format.".to_string());
  }
  let ip_parts: Vec<u32> = parts[0]
    .split('.')
    .map(|part| part.parse::<u32>())
    .collect::<Result<Vec<_>, _>>()
    .map_err(|_| "Invalid IP address.".to_string())?;
  if ip_parts.len() != 4 || ip_parts.iter().any(|p| *p > 255) {
    return Err("Invalid IP address.".to_string());
  }
  let cidr: u32 = parts[1]
    .parse()
    .map_err(|_| "Invalid CIDR value.".to_string())?;
  if cidr > 30 {
    return Err("CIDR must be 30 or less.".to_string());
  }
  let ip = (ip_parts[0] << 24) | (ip_parts[1] << 16) | (ip_parts[2] << 8) | ip_parts[3];
  let mask = if cidr == 0 { 0 } else { (!0u32) << (32 - cidr) };
  Ok((ip & mask, cidr))
}

fn parse_ipv4(ip: &str) -> Option<u32> {
  let parts: Vec<u32> = ip
    .split('.')
    .filter_map(|part| part.parse::<u32>().ok())
    .collect();
  if parts.len() != 4 || parts.iter().any(|part| *part > 255) {
    return None;
  }
  Some((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3])
}

fn ip_in_range(ip: &str, start: u32, end: u32) -> bool {
  parse_ipv4(ip).map(|value| value >= start && value <= end).unwrap_or(false)
}

fn ip_to_string(ip: u32) -> String {
  format!(
    "{}.{}.{}.{}",
    (ip >> 24) & 255,
    (ip >> 16) & 255,
    (ip >> 8) & 255,
    ip & 255
  )
}

fn is_special_ip(ip: &str) -> bool {
  ip.starts_with("224.")
    || ip.starts_with("239.")
    || ip == "255.255.255.255"
}

fn resolve_target(target: &str) -> Result<IpAddr, String> {
  let addr_str = format!("{}:0", target);
  let mut addrs = addr_str
    .to_socket_addrs()
    .map_err(|_| "Unable to resolve target host.".to_string())?;
  addrs
    .next()
    .map(|addr| addr.ip())
    .ok_or_else(|| "Unable to resolve target host.".to_string())
}

fn parse_ports(input: &str) -> Result<Vec<u16>, String> {
  let mut ports = HashSet::new();
  for part in input.split(',') {
    let trimmed = part.trim();
    if trimmed.is_empty() {
      continue;
    }
    if let Some((start, end)) = trimmed.split_once('-') {
      let start_num: u16 = start.trim().parse().map_err(|_| "Invalid port range.".to_string())?;
      let end_num: u16 = end.trim().parse().map_err(|_| "Invalid port range.".to_string())?;
      if start_num == 0 || end_num == 0 || end_num < start_num {
        return Err("Invalid port range.".to_string());
      }
      for port in start_num..=end_num {
        ports.insert(port);
      }
    } else {
      let port: u16 = trimmed.parse().map_err(|_| "Invalid port value.".to_string())?;
      if port == 0 {
        return Err("Invalid port value.".to_string());
      }
      ports.insert(port);
    }
  }
  if ports.is_empty() {
    return Err("No ports to scan.".to_string());
  }
  let mut list: Vec<u16> = ports.into_iter().collect();
  list.sort_unstable();
  Ok(list)
}

fn ping_ip(ip: &str) {
  if cfg!(target_os = "windows") {
    let _ = Command::new("ping")
      .args(["-4", "-n", "1", "-w", "50", ip])
      .output();
  } else if cfg!(target_os = "macos") {
    let _ = Command::new("ping")
      .args(["-c", "1", "-W", "50", ip])
      .output();
  } else {
    let _ = Command::new("ping")
      .args(["-c", "1", "-W", "1", ip])
      .output();
  }
}

fn local_ipv4s() -> Vec<IpDevice> {
  let mut devices = Vec::new();
  if cfg!(target_os = "windows") {
    if let Ok(output) = Command::new("ipconfig").output() {
      let text = String::from_utf8_lossy(&output.stdout);
      for line in text.lines() {
        if !line.contains("IPv4 Address") {
          continue;
        }
        if let Some(value) = line.split(':').nth(1) {
          let ip = value.trim().to_string();
          if !ip.is_empty() {
            devices.push(IpDevice {
              ip,
              mac: "local".to_string(),
              hostname: "This device".to_string(),
              vendor: "Local".to_string(),
            });
          }
        }
      }
    }
  } else if cfg!(target_os = "macos") {
    if let Ok(output) = Command::new("ifconfig").output() {
      let text = String::from_utf8_lossy(&output.stdout);
      for line in text.lines() {
        let trimmed = line.trim_start();
        if trimmed.starts_with("inet ") {
          let parts: Vec<&str> = trimmed.split_whitespace().collect();
          if parts.len() >= 2 {
            let ip = parts[1].to_string();
            devices.push(IpDevice {
              ip,
              mac: "local".to_string(),
              hostname: "This device".to_string(),
              vendor: "Local".to_string(),
            });
          }
        }
      }
    }
  } else {
    if let Ok(output) = Command::new("ip").args(["-4", "addr"]).output() {
      let text = String::from_utf8_lossy(&output.stdout);
      for line in text.lines() {
        let trimmed = line.trim_start();
        if trimmed.starts_with("inet ") {
          let parts: Vec<&str> = trimmed.split_whitespace().collect();
          if parts.len() >= 2 {
            let ip = parts[1].split('/').next().unwrap_or("").to_string();
            if !ip.is_empty() {
              devices.push(IpDevice {
                ip,
                mac: "local".to_string(),
                hostname: "This device".to_string(),
                vendor: "Local".to_string(),
              });
            }
          }
        }
      }
    }
  }
  devices
}

fn parse_arp_table() -> Vec<IpDevice> {
  if cfg!(target_os = "windows") {
    let output = Command::new("arp").arg("-a").output();
    if let Ok(output) = output {
      let text = String::from_utf8_lossy(&output.stdout);
      return text
        .lines()
        .filter_map(|line| {
          let parts: Vec<&str> = line.split_whitespace().collect();
          if parts.len() >= 2 && parts[0].contains('.') && parts[1].contains('-') {
            Some(IpDevice {
              ip: parts[0].to_string(),
              mac: parts[1].to_string(),
              hostname: String::new(),
              vendor: "Unknown".to_string(),
            })
          } else {
            None
          }
        })
        .collect();
    }
  } else if cfg!(target_os = "macos") {
    let output = Command::new("arp").arg("-a").output();
    if let Ok(output) = output {
      let text = String::from_utf8_lossy(&output.stdout);
      return text
        .lines()
        .filter_map(|line| {
          let parts: Vec<&str> = line.split_whitespace().collect();
          if parts.len() >= 4 && parts[1].starts_with('(') {
            let ip = parts[1].trim_matches(&['(', ')'][..]).to_string();
            Some(IpDevice {
              ip,
              mac: parts[3].to_string(),
              hostname: parts[0].to_string(),
              vendor: "Unknown".to_string(),
            })
          } else {
            None
          }
        })
        .collect();
    }
  } else {
    let output = Command::new("ip").args(["neigh", "show"]).output();
    if let Ok(output) = output {
      let text = String::from_utf8_lossy(&output.stdout);
      return text
        .lines()
        .filter_map(|line| {
          let parts: Vec<&str> = line.split_whitespace().collect();
          if parts.len() >= 5 {
            Some(IpDevice {
              ip: parts[0].to_string(),
              mac: parts[4].to_string(),
              hostname: String::new(),
              vendor: "Unknown".to_string(),
            })
          } else {
            None
          }
        })
        .collect();
    }
  }
  Vec::new()
}

fn lookup_arp(ip: &str) -> Option<IpDevice> {
  if is_special_ip(ip) {
    return None;
  }
  if cfg!(target_os = "windows") {
    let output = Command::new("arp").args(["-a", ip]).output().ok()?;
    if !output.status.success() {
      return None;
    }
    let text = String::from_utf8_lossy(&output.stdout);
    for line in text.lines() {
      let parts: Vec<&str> = line.split_whitespace().collect();
      if parts.len() >= 2 && parts[0] == ip && parts[1].contains('-') {
        let mac = parts[1].to_lowercase();
        if mac == "ff-ff-ff-ff-ff-ff" || mac.starts_with("01-00-5e") {
          return None;
        }
        return Some(IpDevice {
          ip: ip.to_string(),
          mac: parts[1].to_string(),
          hostname: String::new(),
          vendor: "Unknown".to_string(),
        });
      }
    }
  } else if cfg!(target_os = "macos") {
  let output = Command::new("arp").args(["-n", ip]).output().ok()?;
  if !output.status.success() {
    return None;
  }
  let text = String::from_utf8_lossy(&output.stdout);
  let parts: Vec<&str> = text.split_whitespace().collect();
  if parts.len() >= 4 {
    let mac = parts[3].to_lowercase();
    if mac == "ff:ff:ff:ff:ff:ff" || mac.starts_with("01:00:5e") {
      return None;
    }
    return Some(IpDevice {
      ip: ip.to_string(),
      mac: parts[3].to_string(),
      hostname: parts[0].to_string(),
      vendor: "Unknown".to_string(),
    });
    }
  } else {
  let output = Command::new("ip").args(["neigh", "show", ip]).output().ok()?;
  if !output.status.success() {
    return None;
  }
  let text = String::from_utf8_lossy(&output.stdout);
  let parts: Vec<&str> = text.split_whitespace().collect();
  if parts.len() >= 5 {
    let mac = parts[4].to_lowercase();
    if mac == "ff:ff:ff:ff:ff:ff" || mac.starts_with("01:00:5e") {
      return None;
    }
    return Some(IpDevice {
      ip: ip.to_string(),
      mac: parts[4].to_string(),
      hostname: String::new(),
        vendor: "Unknown".to_string(),
      });
    }
  }
  None
}

fn scan_windows() -> Result<Vec<WifiNetwork>, String> {
  let output = Command::new("netsh")
    .args(["wlan", "show", "networks", "mode=bssid"])
    .output()
    .map_err(|error| error.to_string())?;
  if !output.status.success() {
    return Err(String::from_utf8_lossy(&output.stderr).to_string());
  }
  let text = String::from_utf8_lossy(&output.stdout);
  let mut networks: Vec<WifiNetwork> = Vec::new();
  let mut current = WifiNetwork {
    ssid: String::new(),
    security: "Unknown".to_string(),
    signal: None,
    frequency: None,
    channel: None,
  };

  for line in text.lines() {
    let trimmed = line.trim();
    if trimmed.starts_with("SSID ") && trimmed.contains(" : ") {
      if !current.ssid.is_empty() {
        networks.push(current.clone());
      }
      let ssid = trimmed.splitn(2, " : ").nth(1).unwrap_or("").trim();
      current = WifiNetwork {
        ssid: if ssid.is_empty() { "Hidden".to_string() } else { ssid.to_string() },
        security: "Unknown".to_string(),
        signal: None,
        frequency: None,
        channel: None,
      };
      continue;
    }
    if trimmed.starts_with("Authentication") {
      if let Some(value) = trimmed.splitn(2, " : ").nth(1) {
        current.security = value.trim().to_string();
      }
    }
    if trimmed.starts_with("Signal") {
      if let Some(value) = trimmed.splitn(2, " : ").nth(1) {
        let cleaned = value.trim().trim_end_matches('%');
        current.signal = cleaned.parse::<i32>().ok();
      }
    }
    if trimmed.starts_with("Channel") {
      if let Some(value) = trimmed.splitn(2, " : ").nth(1) {
        if let Ok(channel) = value.trim().parse::<i32>() {
          current.channel = Some(channel);
          current.frequency = channel_to_frequency(channel);
        }
      }
    }
  }
  if !current.ssid.is_empty() {
    networks.push(current);
  }
  Ok(networks)
}

fn connected_ssid_windows() -> Option<String> {
  let output = Command::new("netsh")
    .args(["wlan", "show", "interfaces"])
    .output()
    .ok()?;
  if !output.status.success() {
    return None;
  }
  let text = String::from_utf8_lossy(&output.stdout);
  let mut is_connected = false;
  let mut ssid = None;
  for line in text.lines() {
    let trimmed = line.trim();
    if trimmed.starts_with("State") && trimmed.contains(":") {
      is_connected = trimmed.to_lowercase().contains("connected");
    }
    if trimmed.starts_with("SSID") && trimmed.contains(":") {
      let value = trimmed.splitn(2, ":").nth(1).unwrap_or("").trim();
      if !value.is_empty() && !value.contains("BSSID") {
        ssid = Some(value.to_string());
      }
    }
  }
  if is_connected { ssid } else { None }
}

fn is_bssid(token: &str) -> bool {
  token.len() == 17 && token.chars().filter(|c| *c == ':').count() == 5
}

fn scan_macos() -> Result<Vec<WifiNetwork>, String> {
  let output = Command::new(
    "/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport",
  )
  .arg("-s")
  .output()
  .map_err(|error| error.to_string())?;
  if !output.status.success() {
    return Err(String::from_utf8_lossy(&output.stderr).to_string());
  }
  let text = String::from_utf8_lossy(&output.stdout);
  let mut networks = Vec::new();
  for (idx, line) in text.lines().enumerate() {
    if idx == 0 {
      continue;
    }
    let parts: Vec<&str> = line.split_whitespace().collect();
    if parts.is_empty() {
      continue;
    }
    let bssid_index = parts.iter().position(|part| is_bssid(part));
    let bssid_index = match bssid_index {
      Some(value) => value,
      None => continue,
    };
    let bssid = parts[bssid_index];
    let ssid = line
      .split(bssid)
      .next()
      .unwrap_or("")
      .trim()
      .to_string();
    let rssi = parts.get(bssid_index + 1).and_then(|value| value.parse::<i32>().ok());
    let channel_str = parts
      .get(bssid_index + 2)
      .map(|value| value.split(',').next().unwrap_or(*value));
    let channel = channel_str.and_then(|value| value.parse::<i32>().ok());
    let frequency = channel.and_then(channel_to_frequency);
    let security = if parts.len() > bssid_index + 5 {
      parts[bssid_index + 5..].join(" ")
    } else {
      "Unknown".to_string()
    };
    networks.push(WifiNetwork {
      ssid: if ssid.is_empty() { "Hidden".to_string() } else { ssid },
      security,
      signal: rssi,
      frequency,
      channel,
    });
  }
  Ok(networks)
}

fn connected_ssid_macos() -> Option<String> {
  let output = Command::new(
    "/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport",
  )
  .arg("-I")
  .output()
  .ok()?;
  if !output.status.success() {
    return None;
  }
  let text = String::from_utf8_lossy(&output.stdout);
  for line in text.lines() {
    let trimmed = line.trim();
    if trimmed.starts_with("SSID:") {
      let value = trimmed.splitn(2, ":").nth(1).unwrap_or("").trim();
      if !value.is_empty() {
        return Some(value.to_string());
      }
    }
  }
  None
}

fn scan_linux() -> Result<Vec<WifiNetwork>, String> {
  let output = Command::new("nmcli")
    .args(["-t", "-f", "SSID,SECURITY,SIGNAL,FREQ", "dev", "wifi"])
    .output()
    .map_err(|error| error.to_string())?;
  if !output.status.success() {
    return Err(String::from_utf8_lossy(&output.stderr).to_string());
  }
  let text = String::from_utf8_lossy(&output.stdout);
  let mut networks = Vec::new();
  for line in text.lines() {
    if line.trim().is_empty() {
      continue;
    }
    let mut parts = line.splitn(4, ':');
    let ssid = parts.next().unwrap_or("").trim();
    let security = parts.next().unwrap_or("").trim();
    let signal = parts
      .next()
      .and_then(|value| value.trim().parse::<i32>().ok());
    let frequency = parts
      .next()
      .and_then(|value| value.trim().parse::<i32>().ok());
    let channel = frequency.and_then(frequency_to_channel);
    networks.push(WifiNetwork {
      ssid: if ssid.is_empty() { "Hidden".to_string() } else { ssid.to_string() },
      security: if security.is_empty() {
        "Open".to_string()
      } else {
        security.to_string()
      },
      signal,
      frequency,
      channel,
    });
  }
  Ok(networks)
}

fn connected_ssid_linux() -> Option<String> {
  let output = Command::new("nmcli")
    .args(["-t", "-f", "ACTIVE,SSID", "dev", "wifi"])
    .output()
    .ok()?;
  if !output.status.success() {
    return None;
  }
  let text = String::from_utf8_lossy(&output.stdout);
  for line in text.lines() {
    if line.starts_with("yes:") {
      let ssid = line.splitn(2, ':').nth(1).unwrap_or("").trim();
      if !ssid.is_empty() {
        return Some(ssid.to_string());
      }
    }
  }
  None
}

#[tauri::command]
fn wifi_scan() -> Result<WifiScanResponse, String> {
  let networks = if cfg!(target_os = "windows") {
    scan_windows()?
  } else if cfg!(target_os = "macos") {
    scan_macos()?
  } else {
    scan_linux()?
  };
  let connected_ssid = if cfg!(target_os = "windows") {
    connected_ssid_windows()
  } else if cfg!(target_os = "macos") {
    connected_ssid_macos()
  } else {
    connected_ssid_linux()
  };

  Ok(WifiScanResponse {
    ok: true,
    timestamp: unix_timestamp(),
    networks,
    connected_ssid,
  })
}

fn netbios_name_windows(ip: &str) -> Option<String> {
  let output = Command::new("nbtstat").args(["-A", ip]).output().ok()?;
  if !output.status.success() {
    return None;
  }
  let text = String::from_utf8_lossy(&output.stdout);
  for line in text.lines() {
    if !line.contains("<00>") || !line.contains("UNIQUE") {
      continue;
    }
    let name = line.split_whitespace().next().unwrap_or("").trim();
    if !name.is_empty() && name != ip {
      return Some(name.to_string());
    }
  }
  None
}

fn resolve_hostname(ip: &str, deep: bool) -> Option<String> {
  if !deep {
    return None;
  }
  if cfg!(target_os = "windows") {
    return netbios_name_windows(ip);
  }
  None
}

fn probe_tcp(ip: &str) -> bool {
  const PORTS: [u16; 6] = [80, 443, 22, 445, 139, 3389];
  let addr = match IpAddr::from_str(ip) {
    Ok(value) => value,
    Err(_) => return false,
  };
  for port in PORTS {
    let socket = SocketAddr::new(addr, port);
    if TcpStream::connect_timeout(&socket, Duration::from_millis(160)).is_ok() {
      return true;
    }
  }
  false
}

#[tauri::command]
async fn ip_scan_start(
  app: tauri::AppHandle,
  subnet: String,
  deep: bool,
) -> Result<IpScanResponse, String> {
  let (network, cidr) = parse_cidr(&subnet)?;
  if IP_SCAN_RUNNING.swap(true, Ordering::SeqCst) {
    return Err("Scan already running.".to_string());
  }
  IP_SCAN_CANCEL.store(false, Ordering::SeqCst);
  let handle = app.clone();
  tauri::async_runtime::spawn_blocking(move || {
    let host_count = 1u32 << (32 - cidr);
    let max_hosts = 512u32;
    if host_count > max_hosts {
      let _ = handle.emit("ip_scan_stopped", ());
      IP_SCAN_RUNNING.store(false, Ordering::SeqCst);
      return;
    }
    let start = network;
    let end = network + host_count - 1;
    let total = end.saturating_sub(start).saturating_add(1) as usize;
    let seen_ips = Arc::new(Mutex::new(HashSet::new()));
    let emitted = Arc::new(std::sync::atomic::AtomicUsize::new(0));
    let completed = Arc::new(std::sync::atomic::AtomicUsize::new(0));
    for device in local_ipv4s() {
      if is_special_ip(&device.ip) || !ip_in_range(&device.ip, start, end) {
        continue;
      }
      let mut lock = seen_ips.lock().unwrap();
      if lock.insert(device.ip.clone()) {
        emitted.fetch_add(1, Ordering::SeqCst);
        let _ = handle.emit("ip_scan_device", device);
      }
    }
    for device in parse_arp_table() {
      if is_special_ip(&device.ip) || !ip_in_range(&device.ip, start, end) {
        continue;
      }
      let mut lock = seen_ips.lock().unwrap();
      if lock.insert(device.ip.clone()) {
        emitted.fetch_add(1, Ordering::SeqCst);
        let _ = handle.emit("ip_scan_device", device);
      }
    }
    let ips: Vec<u32> = (start..=end).collect();
    let index = Arc::new(std::sync::atomic::AtomicUsize::new(0));
    let workers = 64.min(ips.len().max(1));
    let mut handles = Vec::new();
    for _ in 0..workers {
      let index = Arc::clone(&index);
      let completed = Arc::clone(&completed);
      let seen_ips = Arc::clone(&seen_ips);
      let emitted = Arc::clone(&emitted);
      let ips = ips.clone();
      let handle = handle.clone();
      let worker = thread::spawn(move || {
        loop {
          if IP_SCAN_CANCEL.load(Ordering::SeqCst) {
            break;
          }
          let idx = index.fetch_add(1, Ordering::SeqCst);
          if idx >= ips.len() {
            break;
          }
          let ip_str = ip_to_string(ips[idx]);
          if is_special_ip(&ip_str) {
            continue;
          }
            ping_ip(&ip_str);
            if let Some(mut device) = lookup_arp(&ip_str) {
              if device.hostname.is_empty() {
                if let Some(name) = resolve_hostname(&device.ip, deep) {
                  device.hostname = name;
                }
              }
              let mut lock = seen_ips.lock().unwrap();
              if lock.insert(device.ip.clone()) {
                emitted.fetch_add(1, Ordering::SeqCst);
                let _ = handle.emit("ip_scan_device", device);
              }
            } else if deep {
              let hostname = resolve_hostname(&ip_str, deep).unwrap_or_default();
              let should_emit = !hostname.is_empty() || probe_tcp(&ip_str);
              if should_emit {
                let mut lock = seen_ips.lock().unwrap();
                if lock.insert(ip_str.clone()) {
                  emitted.fetch_add(1, Ordering::SeqCst);
                  let _ = handle.emit(
                    "ip_scan_device",
                    IpDevice {
                      ip: ip_str.clone(),
                      mac: "unknown".to_string(),
                      hostname,
                      vendor: "Unknown".to_string(),
                    },
                  );
                }
              }
            }
          let done = completed.fetch_add(1, Ordering::SeqCst) + 1;
          let percent = ((done as f32 / total as f32) * 100.0) as u32;
          let _ = handle.emit("ip_scan_progress", IpScanProgress { percent });
        }
      });
      handles.push(worker);
    }
    for worker in handles {
      let _ = worker.join();
    }
    if IP_SCAN_CANCEL.load(Ordering::SeqCst) {
      let _ = handle.emit("ip_scan_stopped", ());
      IP_SCAN_RUNNING.store(false, Ordering::SeqCst);
      return;
    }
    for device in parse_arp_table() {
      if is_special_ip(&device.ip) || !ip_in_range(&device.ip, start, end) {
        continue;
      }
      let mut lock = seen_ips.lock().unwrap();
      if lock.insert(device.ip.clone()) {
        emitted.fetch_add(1, Ordering::SeqCst);
        let _ = handle.emit("ip_scan_device", device);
      }
    }
    let count = emitted.load(Ordering::SeqCst);
    let _ = handle.emit("ip_scan_done", IpScanDone { count });
    IP_SCAN_RUNNING.store(false, Ordering::SeqCst);
  });
  Ok(IpScanResponse {
    ok: true,
    devices: Vec::new(),
  })
}

#[tauri::command]
fn ip_scan_stop(app: tauri::AppHandle) -> Result<IpScanResponse, String> {
  IP_SCAN_CANCEL.store(true, Ordering::SeqCst);
  let _ = app.emit("ip_scan_stopped", ());
  Ok(IpScanResponse { ok: true, devices: Vec::new() })
}

#[tauri::command]
async fn port_scan_start(
  app: tauri::AppHandle,
  target: String,
  ports: String,
  timeout_ms: Option<u64>,
) -> Result<PortScanResponse, String> {
  if PORT_SCAN_RUNNING.swap(true, Ordering::SeqCst) {
    return Err("Scan already running.".to_string());
  }
  PORT_SCAN_CANCEL.store(false, Ordering::SeqCst);
  let target_ip = resolve_target(&target)?;
  let ports_list = parse_ports(&ports)?;
  let timeout = timeout_ms.unwrap_or(200).clamp(50, 2000);
  let handle = app.clone();
  tauri::async_runtime::spawn_blocking(move || {
    let total = ports_list.len().max(1);
    let index = Arc::new(std::sync::atomic::AtomicUsize::new(0));
    let completed = Arc::new(std::sync::atomic::AtomicUsize::new(0));
    let open_ports = Arc::new(Mutex::new(HashSet::new()));
    let workers = 64.min(total);
    let mut handles = Vec::new();
    for _ in 0..workers {
      let index = Arc::clone(&index);
      let completed = Arc::clone(&completed);
      let open_ports = Arc::clone(&open_ports);
      let ports_list = ports_list.clone();
      let handle = handle.clone();
      let target_ip = target_ip;
      let worker = thread::spawn(move || {
        loop {
          if PORT_SCAN_CANCEL.load(Ordering::SeqCst) {
            break;
          }
          let idx = index.fetch_add(1, Ordering::SeqCst);
          if idx >= ports_list.len() {
            break;
          }
          let port = ports_list[idx];
          let addr = SocketAddr::new(target_ip, port);
          if TcpStream::connect_timeout(&addr, Duration::from_millis(timeout)).is_ok() {
            let mut lock = open_ports.lock().unwrap();
            if lock.insert(port) {
              let _ = handle.emit("port_scan_port", PortScanHit { port });
            }
          }
          let done = completed.fetch_add(1, Ordering::SeqCst) + 1;
          let percent = ((done as f32 / total as f32) * 100.0) as u32;
          let _ = handle.emit("port_scan_progress", PortScanProgress { percent });
        }
      });
      handles.push(worker);
    }
    for worker in handles {
      let _ = worker.join();
    }
    if PORT_SCAN_CANCEL.load(Ordering::SeqCst) {
      let _ = handle.emit("port_scan_stopped", ());
      PORT_SCAN_RUNNING.store(false, Ordering::SeqCst);
      return;
    }
    let count = open_ports.lock().map(|lock| lock.len()).unwrap_or(0);
    let _ = handle.emit("port_scan_done", PortScanDone { count });
    PORT_SCAN_RUNNING.store(false, Ordering::SeqCst);
  });
  Ok(PortScanResponse { ok: true })
}

#[tauri::command]
fn port_scan_stop(app: tauri::AppHandle) -> Result<PortScanResponse, String> {
  PORT_SCAN_CANCEL.store(true, Ordering::SeqCst);
  let _ = app.emit("port_scan_stopped", ());
  Ok(PortScanResponse { ok: true })
}

#[tauri::command]
fn wifi_report(payload: WifiReportPayload) -> Result<String, String> {
  let title = payload
    .title
    .unwrap_or_else(|| "Secure Wi-Fi Scanner Report".to_string());
  let (doc, page1, layer1) = PdfDocument::new(title.clone(), Mm(210.0), Mm(297.0), "Layer 1");
  let layer = doc.get_page(page1).get_layer(layer1);
  let font = doc
    .add_builtin_font(BuiltinFont::Helvetica)
    .map_err(|error| error.to_string())?;
  let font_bold = doc
    .add_builtin_font(BuiltinFont::HelveticaBold)
    .map_err(|error| error.to_string())?;

  let mut y = 280.0;
  layer.use_text(title, 16.0, Mm(20.0), Mm(y), &font_bold);
  y -= 10.0;
  layer.use_text(
    format!("Generated: {}", chrono::Local::now().format("%Y-%m-%d %H:%M:%S")),
    9.0,
    Mm(20.0),
    Mm(y),
    &font,
  );
  y -= 12.0;

  if payload.networks.is_empty() {
    layer.use_text("No networks found.", 11.0, Mm(20.0), Mm(y), &font);
  } else {
    layer.use_text("SSID", 10.0, Mm(20.0), Mm(y), &font_bold);
    layer.use_text("Security", 10.0, Mm(90.0), Mm(y), &font_bold);
    layer.use_text("Signal", 10.0, Mm(130.0), Mm(y), &font_bold);
    layer.use_text("Chan", 10.0, Mm(160.0), Mm(y), &font_bold);
    layer.use_text("Freq", 10.0, Mm(185.0), Mm(y), &font_bold);
    y -= 8.0;
    for item in payload.networks.iter() {
      if y < 20.0 {
        break;
      }
      let signal = item
        .signal
        .map(|value| value.to_string())
        .unwrap_or_else(|| "-".to_string());
      let frequency = item
        .frequency
        .map(|value| value.to_string())
        .unwrap_or_else(|| "-".to_string());
      let channel = item
        .channel
        .map(|value| value.to_string())
        .unwrap_or_else(|| "-".to_string());
      layer.use_text(&item.ssid, 9.0, Mm(20.0), Mm(y), &font);
      layer.use_text(&item.security, 9.0, Mm(90.0), Mm(y), &font);
      layer.use_text(signal, 9.0, Mm(130.0), Mm(y), &font);
      layer.use_text(channel, 9.0, Mm(160.0), Mm(y), &font);
      layer.use_text(frequency, 9.0, Mm(185.0), Mm(y), &font);
      y -= 6.5;
    }
  }

  let mut buffer = Vec::new();
  {
    let mut writer = BufWriter::new(&mut buffer);
    doc
      .save(&mut writer)
      .map_err(|error| error.to_string())?;
  }
  Ok(STANDARD.encode(buffer))
}

#[tauri::command]
async fn run_terminal(cmd: String) -> Result<TerminalResult, String> {
  let trimmed = cmd.trim();
  if trimmed.is_empty() {
    return Err("Empty command".to_string());
  }
  let cmd_owned = trimmed.to_string();
  let output = async_runtime::spawn_blocking(move || {
    #[cfg(target_os = "windows")]
    let shell = "cmd";
    #[cfg(not(target_os = "windows"))]
    let shell = "sh";

    #[cfg(target_os = "windows")]
    let args = vec!["/C", &cmd_owned];
    #[cfg(not(target_os = "windows"))]
    let args = vec!["-c", &cmd_owned];

    Command::new(shell).args(args).output()
  })
  .await
  .map_err(|e| e.to_string())?
  .map_err(|e| e.to_string())?;

  let stdout = String::from_utf8_lossy(&output.stdout).to_string();
  let stderr = String::from_utf8_lossy(&output.stderr).to_string();
  let mut combined = String::new();
  if !stdout.trim().is_empty() {
    combined.push_str(stdout.trim_end());
  }
  if !stderr.trim().is_empty() {
    if !combined.is_empty() {
      combined.push_str("\n");
    }
    combined.push_str(stderr.trim_end());
  }
  if combined.is_empty() {
    combined.push_str("(no output; command may require admin or produced nothing)");
  } else if !output.status.success() {
    combined.push_str("\n\n(non-zero exit; command may require admin or flags)");
  }
  if combined.len() > 8000 {
    combined.truncate(8000);
    combined.push_str("\n...[truncated]");
  }
  Ok(TerminalResult {
    output: combined,
    exit_code: output.status.code().unwrap_or(-1),
  })
}

#[tauri::command]
async fn run_proxy_request(
  url: String,
  method: String,
  headers: Option<Vec<(String, String)>>,
  body: Option<String>,
) -> Result<ProxyResponse, String> {
  let parsed = Url::parse(&url).map_err(|_| "Invalid URL".to_string())?;
  if parsed.scheme() != "http" && parsed.scheme() != "https" {
    return Err("Only http/https URLs are allowed".to_string());
  }
  let client = Client::builder()
    .danger_accept_invalid_certs(true)
    .redirect(reqwest::redirect::Policy::limited(5))
    .timeout(Duration::from_secs(20))
    .build()
    .map_err(|e| e.to_string())?;
  let method = Method::from_bytes(method.as_bytes()).unwrap_or(Method::GET);
  let mut req = client.request(method, parsed);
  if let Some(list) = headers {
    for (k, v) in list {
      if k.is_empty() {
        continue;
      }
      req = req.header(k, v);
    }
  }
  if let Some(b) = body {
    if !b.is_empty() {
      req = req.body(b);
    }
  }
  let resp = req.send().await.map_err(|e| e.to_string())?;
  let status = resp.status();
  let reason = status.canonical_reason().unwrap_or("Unknown").to_string();
  let mut header_pairs = Vec::new();
  for (k, v) in resp.headers().iter() {
    header_pairs.push((k.to_string(), v.to_str().unwrap_or("").to_string()));
  }
  let bytes = resp.bytes().await.map_err(|e| e.to_string())?;
  let mut body_text = String::from_utf8_lossy(&bytes).to_string();
  if body_text.len() > 8000 {
    body_text.truncate(8000);
    body_text.push_str("\n...[truncated]");
  }
  Ok(ProxyResponse {
    status: status.as_u16(),
    reason,
    headers: header_pairs,
    body: body_text,
  })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
      wifi_scan,
      wifi_report,
      ip_scan_start,
      ip_scan_stop,
      port_scan_start,
      port_scan_stop,
      run_terminal,
      run_proxy_request
    ])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
