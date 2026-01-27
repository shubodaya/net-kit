/**
 * Command Registry - Platform and Vendor data for Command Assist
 * Organized by platform type, then by action/intent
 */

export const commandRegistry = {
  platforms: {
    windows: {
      name: "Windows",
      description: "Windows Server and Workstation commands",
      icon: "🪟",
      categories: {
        network: {
          title: "Network Commands",
          suggestions: [
            { label: "Show IP configuration", command: "ipconfig /all" },
            { label: "Test connectivity (ping)", command: "ping example.com" },
            { label: "Traceroute", command: "tracert example.com" },
            { label: "Show routing table", command: "route print" },
            { label: "Show network connections", command: "netstat -ano" },
            { label: "Show network adapters", command: "Get-NetAdapter" },
          ],
        },
        process: {
          title: "Process Management",
          suggestions: [
            { label: "List running processes", command: "tasklist" },
            { label: "Show process details", command: "tasklist /v" },
            { label: "Kill process by name", command: "taskkill /IM app.exe" },
            { label: "Kill process by PID", command: "taskkill /PID 1234" },
            { label: "Show resource usage", command: "Get-Process | Sort-Object CPU -Descending" },
          ],
        },
        disk: {
          title: "Disk & Storage",
          suggestions: [
            { label: "Check disk space", command: "diskpart > list disk" },
            { label: "Show folder size", command: "Get-ChildItem -Recurse | Measure-Object -Sum Length" },
            { label: "CHKDSK", command: "chkdsk C: /F" },
            { label: "Defragment drive", command: "defrag C:" },
            { label: "Format drive", command: "format D: /FS:NTFS" },
          ],
        },
        services: {
          title: "Services & Daemons",
          suggestions: [
            { label: "List services", command: "Get-Service" },
            { label: "Start service", command: "Start-Service ServiceName" },
            { label: "Stop service", command: "Stop-Service ServiceName" },
            { label: "Restart service", command: "Restart-Service ServiceName" },
            { label: "Service status", command: "Get-Service ServiceName" },
          ],
        },
        users: {
          title: "User & Account Management",
          suggestions: [
            { label: "List user accounts", command: "net user" },
            { label: "Create user", command: "net user username password /add" },
            { label: "Delete user", command: "net user username /delete" },
            { label: "List user groups", command: "Get-LocalGroupMember -Group Administrators" },
            { label: "Show logged-in users", command: "query user" },
          ],
        },
        logs: {
          title: "Event Logs & Diagnostics",
          suggestions: [
            { label: "Show event log", command: 'Get-EventLog -LogName System -Newest 50' },
            { label: "Filter errors", command: 'Get-EventLog -LogName System -EntryType Error' },
            { label: "Export event log", command: "wevtutil epl System system.evtx" },
            { label: "Clear event log", command: "Clear-EventLog -LogName System" },
          ],
        },
      },
    },
    linux: {
      name: "Linux",
      description: "Linux server and workstation commands",
      icon: "🐧",
      categories: {
        network: {
          title: "Network Commands",
          suggestions: [
            { label: "Show IP configuration", command: "ip addr show" },
            { label: "Test connectivity (ping)", command: "ping -c 4 example.com" },
            { label: "Traceroute", command: "traceroute example.com" },
            { label: "Show routing table", command: "ip route show" },
            { label: "Show network connections", command: "ss -tulpn" },
            { label: "Show listening ports", command: "netstat -tlnp" },
            { label: "Check DNS resolution", command: "nslookup example.com" },
          ],
        },
        process: {
          title: "Process Management",
          suggestions: [
            { label: "List running processes", command: "ps aux" },
            { label: "Process tree", command: "ps auxf" },
            { label: "Kill process", command: "kill -9 PID" },
            { label: "Monitor processes", command: "top" },
            { label: "Show resource usage", command: "free -h" },
          ],
        },
        disk: {
          title: "Disk & Storage",
          suggestions: [
            { label: "Show disk usage", command: "df -h" },
            { label: "Show inode usage", command: "df -i" },
            { label: "Directory size", command: "du -sh /path/to/dir" },
            { label: "Find large files", command: "find / -type f -size +100M" },
            { label: "Mount filesystem", command: "mount /dev/sda1 /mnt" },
          ],
        },
        services: {
          title: "Services & Daemons",
          suggestions: [
            { label: "List systemd services", command: "systemctl list-unit-files --type=service" },
            { label: "Start service", command: "systemctl start servicename" },
            { label: "Stop service", command: "systemctl stop servicename" },
            { label: "Service status", command: "systemctl status servicename" },
            { label: "Enable on boot", command: "systemctl enable servicename" },
          ],
        },
        users: {
          title: "User & Account Management",
          suggestions: [
            { label: "List users", command: "cat /etc/passwd" },
            { label: "Create user", command: "useradd -m -s /bin/bash username" },
            { label: "Delete user", command: "userdel -r username" },
            { label: "List groups", command: "groups username" },
            { label: "Add user to group", command: "usermod -aG groupname username" },
            { label: "Change password", command: "passwd username" },
          ],
        },
        logs: {
          title: "Event Logs & Diagnostics",
          suggestions: [
            { label: "Show syslog", command: "tail -f /var/log/syslog" },
            { label: "Authentication log", command: "tail -f /var/log/auth.log" },
            { label: "Kernel log", command: "dmesg | tail -20" },
            { label: "Application log", command: "journalctl -u servicename -n 50" },
            { label: "Search logs", command: "grep 'error' /var/log/syslog" },
          ],
        },
      },
    },
    macos: {
      name: "macOS",
      description: "macOS system and server commands",
      icon: "🍎",
      categories: {
        network: {
          title: "Network Commands",
          suggestions: [
            { label: "Show IP configuration", command: "ifconfig" },
            { label: "Detailed IP info", command: "ipconfig getifaddr en0" },
            { label: "Test connectivity (ping)", command: "ping -c 4 example.com" },
            { label: "Traceroute", command: "traceroute example.com" },
            { label: "Show routing table", command: "netstat -r" },
            { label: "Show network connections", command: "netstat -an" },
            { label: "DNS resolution", command: "dscacheutil -q host -a name example.com" },
          ],
        },
        process: {
          title: "Process Management",
          suggestions: [
            { label: "List processes", command: "ps aux" },
            { label: "Monitor activity", command: "top" },
            { label: "Kill process", command: "kill -9 PID" },
            { label: "Show resource usage", command: "vm_stat" },
            { label: "Memory info", command: "memory_pressure" },
          ],
        },
        disk: {
          title: "Disk & Storage",
          suggestions: [
            { label: "Show disk space", command: "df -h" },
            { label: "Directory size", command: "du -sh /path" },
            { label: "Find large files", command: "find / -type f -size +100M" },
            { label: "List volumes", command: "diskutil list" },
            { label: "Verify disk", command: "diskutil verifyVolume /" },
          ],
        },
        services: {
          title: "Services & Daemons",
          suggestions: [
            { label: "List services", command: "launchctl list" },
            { label: "Load service", command: "launchctl load /Library/LaunchDaemons/com.name.plist" },
            { label: "Unload service", command: "launchctl unload /Library/LaunchDaemons/com.name.plist" },
            { label: "Service status", command: "launchctl list | grep servicename" },
          ],
        },
        users: {
          title: "User & Account Management",
          suggestions: [
            { label: "List users", command: "dscl . list /Users" },
            { label: "User info", command: "dscl . read /Users/username" },
            { label: "Create user", command: "dscl . create /Users/username" },
            { label: "List admin users", command: "dscl . list /Groups/admin GroupMembership" },
          ],
        },
        logs: {
          title: "Event Logs & Diagnostics",
          suggestions: [
            { label: "Show system log", command: "log show --predicate 'eventMessage contains[c] error' --last 1h" },
            { label: "Real-time log", command: "log stream" },
            { label: "Kernel panic logs", command: "log show --predicate 'process == \"kernel\"' | head -100" },
            { label: "Auth log", command: "log show --predicate 'process == \"loginwindow\"' | head -50" },
          ],
        },
      },
    },
  },

  vendors: {
    cisco: {
      name: "Cisco",
      description: "Cisco IOS/IOS XE networking devices - Advanced enterprise commands",
      icon: "🔌",
      devices: ["Router", "Switch", "ASA Firewall", "Wireless Controller"],
      explorationPrompt: "What aspect of Cisco would you like to explore?",
      categories: {
        device_management: {
          title: "Device Management & Lifecycle",
          command: "Understanding boot sequences, configuration backup, and recovery",
        },
        console_access: {
          title: "Console & Remote Access Security",
          command: "Hardening SSH, VTY access, and local authentication",
        },
        interface_config: {
          title: "Interface Configuration & QoS",
          command: "Speed/duplex tuning, error handling, and traffic shaping",
        },
        routing_static: {
          title: "Static Routing & Tracking",
          command: "Floating routes, IP SLA monitoring, and failover",
        },
        routing_ospf: {
          title: "OSPF - Routing Protocol",
          command: "Area design, authentication, neighbor tuning, and optimization",
        },
        routing_eigrp: {
          title: "EIGRP - Advanced Routing",
          command: "Metric tuning, route redistribution, and convergence optimization",
        },
        switching_vlan: {
          title: "Switching - VLAN & Trunking",
          command: "VTP, trunk configuration, and inter-VLAN routing",
        },
        switching_stp: {
          title: "Spanning Tree Protocol (STP)",
          command: "Root bridge tuning, portfast, BPDU guard, and loop prevention",
        },
        etherchannel: {
          title: "EtherChannel & Link Aggregation",
          command: "LACP, PAgP, and static bundles with L3 support",
        },
        port_security: {
          title: "Port Security & DHCP Snooping",
          command: "MAC learning, sticky addresses, and ARP inspection",
        },
        dhcp: {
          title: "DHCP - Client & Server",
          command: "DHCP pools, excluded addresses, and relay agents",
        },
        nat: {
          title: "NAT - Static, Dynamic, & Overload",
          command: "Route maps, policy NAT, and VRF-aware translation",
        },
        hsrp: {
          title: "HSRP - High Availability",
          command: "Virtual IP configuration, priorities, and failover",
        },
        acl: {
          title: "ACL - Standard & Extended",
          command: "Named ACLs, time-based rules, and logging",
        },
        ipv6: {
          title: "IPv6 Addressing & Routing",
          command: "Global unicast, link-local, EUI-64, and static routes",
        },
        security_auth: {
          title: "Authentication & Secrets",
          command: "Enable secret, local users, and scrypt hashing",
        },
        ssh_telnet: {
          title: "SSH & Secure Access",
          command: "SSH v2, public key auth, and access control lists",
        },
        ntp: {
          title: "Network Time Protocol (NTP)",
          command: "Time synchronization and clock settings",
        },
        snmp_logging: {
          title: "SNMP & Syslog Management",
          command: "SNMPv3, remote logging, and trap configuration",
        },
        wireless: {
          title: "Wireless - VLAN & WLC Config",
          command: "SSID creation, RADIUS integration, and AP management",
        },
      },
      actions: {
        "Boot sequence & recovery": {
          category: "device_management",
          command: "boot system flash:c3850-universalk9.17.06.05.SPA.bin\nconfig-register 0x2102",
          explanation: "Pin specific IOS version and set normal boot mode. Use 0x2120 to enter ROMMON for recovery.",
          warning: "Incorrect config-register can prevent normal boot. Always verify before reload.",
          example: "Reload device to apply: reload\nEnable boot from specific image to prevent downgrade attacks",
          advanced: "rommon 1 > set BAUD 115200 (stabilize serial) | boot system tftp:image.bin <server> (network boot)",
        },
        "Config backup & rollback": {
          category: "device_management",
          command: "archive\n path flash:backups/config-$h-$t\n write-memory\n time-period 1440",
          explanation: "Automatic config snapshots every 24hrs with hostname/timestamp. Enable atomic transactions on IOS XE.",
          warning: "Backups require adequate flash space. Monitor with 'show archive'.",
          example: "show archive (lists snapshots) | configure replace flash:backups/old-config (rollback)",
          advanced: "rollback-timeout 900 (auto-commit after 15min, fail-safe on IOS XE) | show diff rollback-replace",
        },
        "Credential storage (scrypt)": {
          category: "security_auth",
          command: "enable algorithm-type scrypt secret <password>\nusername admin algorithm-type scrypt secret <password>\nservice password-encryption",
          explanation: "Scrypt is FIPS 140-2 compliant and stronger than MD5/SHA1. Obfuscates all passwords in running-config.",
          warning: "Service password-encryption is one-way obfuscation, not encryption. Use key config-key for actual encryption (IOS XE only).",
          example: "Verify with: show run | include username | include enable (passwords show as hashed)",
          advanced: "key config-key universal-secret <key> (IOS XE: encrypts all secrets in config) | show key config-key mismatch",
        },
        "Console security": {
          category: "console_access",
          command: "line console 0\n exec-timeout 15 0\n session-timeout 30\n login authentication default\n logging synchronous level 7",
          explanation: "Sets idle timeout (15min), session limit (30min total), requires auth, and syncs log messages with input.",
          warning: "Overly aggressive timeouts can interrupt long troubleshooting sessions. Balance security & usability.",
          example: "exec-timeout 15 0 (15min idle before logout) | session-timeout 30 (absolute max 30min)",
          advanced: "transport preferred all (limits to certain protocols) | no transport input telnet (disable telnet completely)",
        },
        "VTY hardening (SSH only)": {
          category: "ssh_telnet",
          command: "line vty 0 15\n transport input ssh\n transport output ssh\n ip ssh version 2\n ip ssh authentication-retries 2\n ip ssh time-out 60\n access-class SSH_PERMITTED in",
          explanation: "Forces SSH v2, limits auth attempts to 2 (DDoS mitigation), and restricts access by source IP ACL.",
          warning: "Blocking SSH from all sources will lock you out. Test ACLs before applying.",
          example: "access-class 1 in (uses named ACL to permit only 10.0.100.0/24) | show ip ssh (verify config)",
          advanced: "ssh pubkey-chain username admin / key-hash ssh-rsa <key> (public key auth, eliminates password compromise)",
        },
        "SSH public key authentication": {
          category: "ssh_telnet",
          command: "ip ssh pubkey-chain\n username admin\n  key-hash ssh-rsa <key-hash>\nline vty 0 15\n ssh PubkeyAuth",
          explanation: "Replaces password auth with SSH key pairs. Eliminates credential stuffing attacks. Integrates with Ansible/automation.",
          warning: "Requires SSH client to have private key. If lost, need console access to recover.",
          example: "ssh -i ~/.ssh/id_rsa admin@10.0.0.1 (uses private key) | show ip ssh (verify enabled)",
          advanced: "Combine with access-class for IP + key auth (defense in depth)",
        },
        "Interface speed & duplex": {
          category: "interface_config",
          command: "interface g0/0\n speed 1000\n duplex full\n no shutdown",
          explanation: "Never use 'speed auto / duplex auto' on production uplinks. Hardcode both to prevent mismatches.",
          warning: "Mismatches cause half-duplex collisions and dropped packets. 10G+ auto-negotiate reliably.",
          example: "show interfaces g0/0 (verify 'Full duplex, 1000Mb/s') | speed 100 (legacy devices)",
          advanced: "negotiation auto (modern: let auto-negotiate at 1000Mbps+) | load-interval 60 (smooth 60s stats averages)",
        },
        "Interface MTU & protection": {
          category: "interface_config",
          command: "interface g0/0\n mtu 1500\n ip mtu 1500\n no ip redirects\n no ip proxy-arp\n ip verify unicast source reachable-via rx",
          explanation: "MTU 1500 standard for Ethernet. No redirects/proxy-arp prevents ICMP/spoofing attacks. RPF check validates source reachability.",
          warning: "VPN links may need MTU 1400-1460. Test before production. RPF can block valid traffic if not tuned.",
          example: "show interfaces g0/0 | include MTU (verify) | ip mtu 1460 (VPN adjustment)",
          advanced: "no ip directed-broadcast (disable smurf attack vector) | rate-limit input for DDoS mitigation",
        },
        "QoS - interface shaping": {
          category: "interface_config",
          command: "policy-map SHAPE_UPLINK\n class CRITICAL\n  priority percent 30\n class VOICE\n  bandwidth percent 20\n class default\n  fair-queue\n  police rate 900m peak 1000m\ninterface g0/0\n service-policy output SHAPE_UPLINK",
          explanation: "Shaping smooths excess traffic (buffers). Policing drops excess immediately. Use shaping on uplinks for better flow control.",
          warning: "Shaping adds latency. Monitor with 'show policy-map interface' for drops/tail-drops.",
          example: "priority percent 30 (strict priority for critical) | bandwidth percent 20 (reserved for voice) | fair-queue (FIFO for default)",
          advanced: "service-policy global (vrf-aware QoS for all traffic) | random-detect (RED: probabilistic drop to prevent TCP globalsync)",
        },
        "Troubleshoot quick shows": {
          category: "device_management",
          command:
            "terminal length 0\nshow ip interface brief\nshow ip route\nshow vlan brief\nshow interface trunk\nshow run | begin interface\nshow cdp neighbors detail\nshow version",
          explanation: "One-shot snapshot: interfaces, routing table, VLANs/trunks, running-config at interfaces, neighbors, and platform/IOS details.",
          warning: "Disable terminal length 0 after if you prefer paging.",
          example: "show interface gi0/1 switchport (mode/operational) | show standby brief (HSRP state)",
          advanced: "show processes cpu history | show memory | debug ip packet detail (last resort; filter with ACL)",
        },
        "Base device hardening": {
          category: "device_management",
          command:
            "hostname R1\nno ip domain-lookup\nservice password-encryption\nsecurity passwords min-length 10\nlogin block-for 60 attempts 3 within 30\nenable secret <secret>\nline console 0\n password <console_pass>\n login\n logging synchronous\n exec-timeout 10 0\nline vty 0 4\n transport input ssh\n login local\n ip ssh version 2\nbanner motd ^CUnauthorized access prohibited^C\ncopy running-config startup-config",
          explanation: "Sets hostname, disables DNS on typos, enforces password length, rate-limits brute force, enables SSH-only remote access, and sets MOTD banner.",
          warning: "Verify SSH reachability before disabling telnet or tightening ACLs.",
          example: "show login failures (IOS XE) | show users | show ssh",
          advanced: "aaa new-model with TACACS+/RADIUS | username admin privilege 15 secret <pwd> (local fallback)",
        },
        "Switch VLAN + trunk": {
          category: "switching_vlan",
          command:
            "vlan 10\n name Management\nvlan 20\n name Users\ninterface range gi1/0/1-10\n switchport mode access\n switchport access vlan 20\ninterface gi1/0/48\n switchport trunk encapsulation dot1q\n switchport mode trunk\n switchport trunk native vlan 99\n switchport trunk allowed vlan 1,10,20,99\n spanning-tree portfast trunk",
          explanation: "Creates VLANs, assigns access ports, and builds an 802.1Q trunk with native VLAN 99. Portfast trunk speeds convergence for edge devices (AP/uplink).",
          warning: "Include native VLAN in allowed list. Avoid VLAN 1 for users.",
          example: "show vlan brief | show interface gi1/0/48 trunk",
          advanced: "vtp mode transparent (recommended) | switchport trunk allowed vlan add <id>",
        },
        "Inter-VLAN via router-on-a-stick": {
          category: "switching_vlan",
          command:
            "interface fa0/0\n no ip address\ninterface fa0/0.10\n encapsulation dot1q 10\n ip address 172.16.10.1 255.255.255.0\ninterface fa0/0.20\n encapsulation dot1q 20\n ip address 172.16.20.1 255.255.255.0\ninterface fa0/0.99\n encapsulation dot1q 99 native\n ip address 192.168.99.1 255.255.255.0\nip routing",
          explanation: "Subinterfaces per VLAN with gateway IPs; native VLAN untagged. Enables routing between VLANs.",
          warning: "Remove IP from physical interface. Ensure switch trunk allows the VLANs.",
          example: "show ip route connected | ping 172.16.20.10 source 172.16.10.1",
          advanced: "Add HSRP on subinterfaces for gateway redundancy | ip helper-address on subinterfaces for DHCP relay",
        },
        "HSRP quick config": {
          category: "hsrp",
          command:
            "interface g0/1\n standby version 2\n standby 10 ip 192.168.1.1\n standby 10 priority 110\n standby 10 preempt\n standby 10 track g0/2 20",
          explanation: "Creates HSRP group 10 with virtual IP 192.168.1.1, higher priority 110, preemption, and interface tracking (minus 20 on failure).",
          warning: "Match HSRP version/group on both peers. Virtual IP must be in subnet.",
          example: "show standby brief (Active/Standby) | standby 10 authentication md5 key-string <key>",
          advanced: "Use per-VLAN HSRP groups (or GLBP for load-share) | tune hello/hold for faster failover",
        },
        "Port security (access edge)": {
          category: "port_security",
          command:
            "interface range fa0/1-24\n switchport mode access\n switchport port-security\n switchport port-security maximum 2\n switchport port-security mac-address sticky\n switchport port-security violation restrict\n spanning-tree portfast\n spanning-tree bpduguard enable",
          explanation: "Limits MACs per port, learns them (sticky), and restricts on violation. Enables Portfast + BPDU guard for edge hosts.",
          warning: "Sticky MACs persist in running-config; save after learning. Violation shutdown is default?here using restrict.",
          example: "show port-security interface fa0/10 | show errdisable recovery",
          advanced: "errdisable recovery cause psecure-violation | aging time 5 | aging type inactivity",
        },
        "IPv4 DHCP + relay": {
          category: "dhcp",
          command:
            "ip dhcp excluded-address 192.168.10.1 192.168.10.20\nip dhcp pool USERS\n network 192.168.10.0 255.255.255.0\n default-router 192.168.10.1\n dns-server 8.8.8.8\n domain-name corp.local\n!\ninterface g0/2\n ip helper-address 192.168.10.1",
          explanation: "DHCP pool with exclusions, gateway, DNS, and domain. Helper relays broadcasts to DHCP server across subnets.",
          warning: "Exclude statics and the gateway. Add multiple helper-address lines for redundancy.",
          example: "show ip dhcp binding | clear ip dhcp binding *",
          advanced: "lease 3 (3 days) | option 150 ip <tftp> (IP phones) | ip dhcp snooping + trust on server-facing ports",
        },
        "ACL examples (std/ext)": {
          category: "acl",
          command:
            "ip access-list standard MGMT_ONLY\n permit 10.10.10.0 0.0.0.255\n deny any\n!\nip access-list extended BLOCK_TELNET\n deny tcp any any eq 23 log\n permit ip any any\n!\ninterface g0/0\n ip access-group BLOCK_TELNET in\nline vty 0 4\n access-class MGMT_ONLY in",
          explanation: "Standard ACL controlling VTY access to mgmt subnet; extended ACL blocking telnet applied inbound on an interface.",
          warning: "Implicit deny at end. Test before applying to avoid lockout.",
          example: "show access-lists | show ip access-lists BLOCK_TELNET",
          advanced: "time-range WORK-HOURS 8:00 to 17:00 (schedule ACEs) | log-input on critical denies",
        },
        "NAT (overload + static)": {
          category: "nat",
          command:
            "interface g0/0\n ip nat inside\ninterface s0/0/0\n ip nat outside\nip access-list standard NAT-ELIGIBLE\n permit 192.168.10.0 0.0.0.255\nip nat inside source list NAT-ELIGIBLE interface s0/0/0 overload\nip nat inside source static 192.168.10.50 73.2.34.137",
          explanation: "PAT (overload) shares outside interface IP for inside subnet; static NAT pins internal host to public IP.",
          warning: "Static NAT hosts need ACL/firewall protection. Confirm correct inside/outside roles.",
          example: "show ip nat translations | clear ip nat translation *",
          advanced: "ip nat pool PUBLIC 73.2.34.138 73.2.34.143 netmask 255.255.255.248 | route-maps for policy NAT",
        },
        "PPP with CHAP auth": {
          category: "interface_config",
          command:
            "username R2 password cisco\ninterface s0/0/0\n encapsulation ppp\n ppp authentication chap\n ppp chap hostname R1\n ppp chap password cisco",
          explanation: "Enables PPP on serial link with CHAP authentication using local credentials.",
          warning: "CHAP username must match the remote hostname; passwords must match on both ends.",
          example: "show interfaces s0/0/0 | include Encapsulation PPP | debug ppp negotiation",
          advanced: "ppp quality 80 (drop if quality below 80%) | ppp multilink (bundle links)",
        },
        "OSPF process hardening": {
          category: "routing_ospf",
          command: "router ospf 1\n router-id 192.168.0.1\n auto-cost reference-bandwidth 100000\n passive-interface default\n no passive-interface g0/0\n maximum-paths 4\n default-information originate always metric 100",
          explanation: "Manual router-id prevents flapping. Reference BW 100000 matches 1Gbps uplinks (default 100Mbps undervalues). Passive-interface stops OSPF flooding on untrusted links.",
          warning: "Auto-cost recalculation on change. Default-information originate always injects default even if it fails (use 'always' for redundancy).",
          example: "show ip ospf database (verify LSA counts) | maximum-paths 4 (enable ECMP load-balance across 4 equal routes)",
          advanced: "distribute-list 1 in (filter routes into OSPF) | distribute-list 2 out (filter routes out) | capability opaque (enables OSPF extensions)",
        },
        "OSPF authentication (MD5)": {
          category: "routing_ospf",
          command: "interface g0/0\n ip ospf authentication message-digest\n ip ospf message-digest-key 1 md5 OSPF_KEY_v1\n ip ospf message-digest-key 2 md5 OSPF_KEY_v2\nrouter ospf 1\n area 0 authentication message-digest",
          explanation: "MD5 authentication ensures OSPF neighbors are trusted. Maintain 2 keys (v1 active, v2 standby) for rolling updates.",
          warning: "MD5 is weak cryptographically but sufficient for internal routing. IOS XE 15.4+: use 'ip ospf authentication ipsec' for IPSEC-based auth.",
          example: "show ip ospf interface g0/0 (verify 'MD5 authentication key-id: 1') | Key rotation via automation daily",
          advanced: "ip ospf authentication ipsec spi 256 md5 OSPF_KEY (IOS XE: IPSEC-wrapped auth, stronger) | per-interface auth for mixed domains",
        },
        "OSPF area design (hub-spoke)": {
          category: "routing_ospf",
          command: "router ospf 1\n area 0 range 10.0.0.0 255.255.0.0\n area 10 stub\n area 20 nssa\n area 20 nssa default-information-originate",
          explanation: "Area 0 backbone core only (50-100 routers max). Stub areas get default route instead of external routes (reduces LSA flood). NSSA allows stubs to originate external routes (useful for branches with local exits).",
          warning: "Summarization must be on ABRs only. NSSA Type 7 LSAs convert to Type 5 at ABR boundary (adds 1 hop of latency).",
          example: "show ip ospf database (verify ABR summarization reduces LSA count) | stub area reduces SPF computation by 60%+",
          advanced: "area X virtual-link 192.168.0.2 (tunnel OSPF through non-backbone area if topology broken) | area X nssa no-redistribution",
        },
        "OSPF neighbor & flooding tuning": {
          category: "routing_ospf",
          command: "interface g0/0\n ip ospf hello-interval 5\n ip ospf dead-interval 20\n ip ospf retransmit-interval 10\n ip ospf transmit-delay 2\nrouter ospf 1\n area 0 lsa-filter 10.0.0.0 0.255.255.255",
          explanation: "Hello 5s (detect failures in ~20s instead of default 40s). Dead 4x hello. Retransmit controls LSA resend on no ack. Transmit-delay accounts for link propagation.",
          warning: "Aggressive timers (hello 1s) on WAN links can cause false failures. Tune to link latency + variance.",
          example: "show ip ospf interface g0/0 (verify timers) | Fast convergence: hello 1 dead 4 on LANs; hello 10 dead 40 on high-latency WAN",
          advanced: "lsa-filter suppresses LSA flooding (reduces bandwidth on slow links) | max-lsa 5000 threshold 75 (warns if LSA database grows abnormally)",
        },
        "EIGRP configuration": {
          category: "routing_eigrp",
          command: "router eigrp 100\n no auto-summary\n network 10.0.0.0 0.0.0.255\n passive-interface f0/0\n eigrp router-id 192.168.0.1",
          explanation: "AS 100 local scope only (cannot peer across AS without redistribution). No auto-summary prevents classful summarization. Passive-interface stops hellos on untrusted links.",
          warning: "EIGRP is Cisco proprietary (now opened via RFC 7868). Default timers: hello 5s, hold 15s (LAN); hello 60s, hold 180s (WAN). Auto-tuned on high-latency links.",
          example: "show ip eigrp neighbors (verify peer count) | show ip eigrp topology (verify successor/feasible successor routes)",
          advanced: "metric weights 0 1 0 1 0 0 (customize K-values if default doesn't match behavior) | passive-interface default + no passive-interface <trusted>",
        },
        "Static routing with IP SLA tracking": {
          category: "routing_static",
          command: "ip sla 100\n icmp-echo 10.0.0.2 source-ip 10.0.0.1\n frequency 10\ntrack 100 rtr 100 reachability\nip route 10.1.0.0 255.255.255.0 10.0.0.2 track 100\nip route 10.1.0.0 255.255.255.0 10.0.0.3 20",
          explanation: "SLA monitors next-hop every 10s. If target unreachable, track withdraws primary route; traffic fails over to secondary (AD 20).",
          warning: "SLA adds CPU overhead. Monitor with 'show ip sla statistics'. False positives on congested links.",
          example: "show track (monitor reachability status) | Primary route active until SLA fails, then secondary takes over",
          advanced: "Combine with HSRP for double-failover (link + redundant router) | track ip route 10.1.0.0 reachability (object-track with route metric)",
        },
        "NAT static (1:1 mapping)": {
          category: "nat",
          command: "interface f0/0\n ip nat outside\ninterface f0/1\n ip nat inside\nip nat inside source static 10.0.1.10 203.0.113.3",
          explanation: "Maps internal 10.0.1.10 to external 203.0.113.3. Bidirectional translation. Common for servers requiring static addresses.",
          warning: "Static NAT consumes public IPs (1:1 ratio). High management overhead for many servers.",
          example: "show ip nat translations (verify mapping) | Inbound 203.0.113.3:80 → 10.0.1.10:80",
          advanced: "ip nat inside source static tcp 10.0.1.10 80 203.0.113.3 8080 (port translation) | logging of NAT translations for audit",
        },
        "NAT dynamic pool": {
          category: "nat",
          command: "ip nat pool POOL1 203.0.113.4 203.0.113.12 netmask 255.255.255.240\naccess-list 1 permit 10.0.2.0 0.0.0.255\nip nat inside source list 1 pool POOL1",
          explanation: "Allocates addresses from pool to internal hosts on-demand. Limits to pool size (9 addresses in example). Address released on session timeout.",
          warning: "Pool exhaustion = dropped connections. Monitor with 'show ip nat statistics'. Session timeouts default 300s.",
          example: "show ip nat translations (shows active mappings) | 10.0.2.50 → 203.0.113.8 (temp mapping)",
          advanced: "ip nat pool ... prefix-length 28 (type: prefix translation) | match-in-vrf (VRF-aware NAT for multi-tenant)",
        },
        "NAT overload (PAT)": {
          category: "nat",
          command: "access-list 1 permit 10.0.2.0 0.0.0.255\nip nat inside source list 1 interface f0/0 overload",
          explanation: "Port Address Translation. Maps multiple internal hosts to single external IP using different ports. Most scalable NAT option.",
          warning: "Some protocols (FTP, SIP) fail over PAT due to port mangling. Test before deployment.",
          example: "show ip nat statistics (count active translations) | 10.0.2.50:12345 → 203.0.113.1:54321 (port mapping)",
          advanced: "ip nat inside source route-map POLICY_NAT pool POOL1 (policy-based NAT: match criteria beyond ACL) | VRF-aware: ip nat inside source list 1 interface f0/0 overload vrf CORP",
        },
        "ACL standard (filtering by source IP)": {
          category: "acl",
          command: "ip access-list standard DENY_RFC1918\n deny 10.0.0.0 0.255.255.255\n deny 172.16.0.0 0.15.255.255\n deny 192.168.0.0 0.0.255.255\n permit any log\ninterface f0/0\n ip access-group DENY_RFC1918 in",
          explanation: "Denies RFC1918 ranges inbound (anti-spoofing). Permits all others with logging. Filters by source only.",
          warning: "Standard ACLs are simple but inflexible (can't filter by port/protocol). Use extended ACL for granular control.",
          example: "show access-lists (verify ACL stats & hit counts) | log flag triggers syslog on match",
          advanced: "Object groups (IOS XE): object-group network INTERNAL / network 10.0.0.0 255.0.0.0 / network 172.16.0.0 255.240.0.0 (re-usable IP lists)",
        },
        "ACL extended (filtering by protocol/port)": {
          category: "acl",
          command: "ip access-list extended WEB_TRAFFIC\n permit tcp 10.0.1.0 0.0.0.255 host 203.0.113.100 eq 80\n permit tcp 10.0.1.0 0.0.0.255 host 203.0.113.100 eq 443\n deny tcp 10.0.1.0 0.0.0.255 any log\n permit icmp any any echo\ninterface f0/0\n ip access-group WEB_TRAFFIC out",
          explanation: "Permits HTTP/HTTPS to web server. Denies other TCP (with logging). Permits ICMP echo (ping).",
          warning: "Extended ACLs have higher CPU cost. Avoid very long lists (>100 lines). Use TCAM offload on switches.",
          example: "show ip access-lists WEB_TRAFFIC (shows match counts per line) | deny tcp ... log (triggers syslog violation alerts)",
          advanced: "Time-based ACL (IOS): time-range BUSINESS_HOURS / periodic weekdays 9:00 to 17:00 (apply only during work hours) | dynamic ACL for temp access",
        },
        "ACL with logging & time ranges": {
          category: "acl",
          command: "ip access-list extended LOG_AUDIT\n permit tcp host 10.0.1.50 any eq 22 log\n deny tcp any any eq telnet log\n permit icmp host 10.0.1.60 any echo log-input\ntime-range BUSINESS_HOURS\n periodic weekdays 09:00 to 17:00\nip access-list extended BUSINESS_ONLY\n permit tcp any any time-range BUSINESS_HOURS\n deny tcp any any",
          explanation: "Log flag generates syslog on match (audit trail). Time-based ACL enables/disables rules by clock. Log-input includes ingress interface.",
          warning: "Logging on every packet can overwhelm syslog server. Use rate-limit: logging rate-limit 10 (max 10 logs/sec).",
          example: "show access-lists (hit counts) | 'terminal monitor' on SSH shows real-time logs | Syslog: %SEC_LOGIN-4-UNEXPECTED_COMMAND",
          advanced: "Named time-ranges for re-usability | Dynamic ACL: 'auth-proxy' redirects unauthenticated user to portal first",
        },
        "VLAN trunk configuration": {
          category: "switching_vlan",
          command: "interface g0/1\n switchport trunk encapsulation dot1q\n switchport mode trunk\n switchport trunk native vlan 199\n switchport trunk allowed vlan 10,11,20",
          explanation: "Dot1q standard. Native VLAN 199 (not 1) prevents VLAN hopping. Allowed VLANs restrict traffic (security + cleanup).",
          warning: "Native VLAN mismatch between switches causes spanning-tree loops. Verify with 'show interfaces trunk'.",
          example: "show interfaces g0/1 switchport (verify 'Trunking Mode: on' and 'Allowed VLAN: 10,11,20')",
          advanced: "switchport nonegotiate (disable DTP: mandatory on security-conscious networks) | vlan 199 name NATIVE (document native VLAN)",
        },
        "Router-on-a-stick (inter-VLAN routing)": {
          category: "switching_vlan",
          command: "interface f0/0\n no shutdown\ninterface f0/0.10\n encapsulation dot1q 10\n ip address 10.10.10.1 255.255.255.0\ninterface f0/0.20\n encapsulation dot1q 20\n ip address 10.10.20.1 255.255.255.0",
          explanation: "Single physical link to switch, subinterfaces for each VLAN. Central routing point. Lower cost than dedicated links.",
          warning: "Bottleneck on high-traffic inter-VLAN flows (router CPU limited). Modern: use L3 switch instead.",
          example: "show ip route (shows both 10.10.10.0/24 and 10.10.20.0/24) | show interfaces f0/0.10 (verify subinterface)",
          advanced: "L3 routing on switch (SVI): 'interface vlan 10 / ip address ...' (faster, no external router needed) | HSRP on L3 switch for redundancy",
        },
        "Layer 3 switch (SVI routing)": {
          category: "switching_vlan",
          command: "ip routing\ninterface vlan 10\n ip address 10.10.10.1 255.255.255.0\n no shutdown\ninterface vlan 20\n ip address 10.10.20.1 255.255.255.0\n no shutdown\nrouter ospf 1\n network 10.10.0.0 0.0.255.255 area 0",
          explanation: "Native L3 routing on switch. SVIs (Switched Virtual Interfaces) are logical per-VLAN. Much faster than router-on-stick.",
          warning: "IP routing consumes switch CPU. Modern switches handle this well (ASIC-based). Older switches may need separate router.",
          example: "show ip route (routes VLAN 10 ↔ VLAN 20 via switch) | show ip ospf neighbors (L3 switch peers with router)",
          advanced: "ip routing enabled globally | SVI on every VLAN for inter-VLAN traffic; dedicated router for external routes",
        },
        "Spanning Tree - root bridge selection": {
          category: "switching_stp",
          command: "spanning-tree vlan 10 root primary\nspanning-tree vlan 10 priority 24576\nspanning-tree vlan 20 root secondary\nspanning-tree vlan 20 priority 28672",
          explanation: "Root primary = 24576 (guarantees root). Secondary = 28672 (backup). Prevents accidental root election.",
          warning: "Default priority 32768. Always explicitly set root (never rely on default). Verify with 'show spanning-tree vlan 10'.",
          example: "show spanning-tree vlan 10 (lists Root ID, Bridge ID, timers) | VLAN 20 secondary becomes root if primary fails",
          advanced: "Spread VLAN groups across switches: some VLANs on SW1 (root), others on SW2 (root). Balances data plane traffic.",
        },
        "Spanning Tree - portfast & BPDU guard": {
          category: "switching_stp",
          command: "spanning-tree portfast default\nspanning-tree bpduguard default\nerrdisable recovery cause bpduguard\nerrdisable recovery interval 30\ninterface f0/1\n spanning-tree portfast\n spanning-tree bpduguard enable",
          explanation: "Portfast skips STP waiting (DISABLED→FORWARDING in 1 sec). Enabled on access ports (hosts, servers). BPDU guard disables port if unexpected BPDU received (prevents rogue switch injection).",
          warning: "Portfast on trunk link = instant loop if misconfigured. Only on access ports. Errdisable recovery auto-enables after 30s (allows time to disconnect rogue device).",
          example: "show spanning-tree interface f0/1 portfast (verify ENABLED) | Rogue BPDU → port shutdown → auto-recovery after 30s",
          advanced: "spanning-tree bpdufilter enable (silent mode: no BPDU at all) | spanning-tree guard root (on root links only, prevents rogue root)",
        },
        "Spanning Tree - loop guard & root guard": {
          category: "switching_stp",
          command: "spanning-tree loopguard default\ninterface f0/2\n spanning-tree guard root\ninterface f0/3\n spanning-tree guard loop",
          explanation: "Loop guard prevents alternate port from becoming designated (if no BPDUs received). Root guard on core links prevents inferior root election.",
          warning: "Loop guard can block valid failovers if BPDUs delayed. Test thoroughly before prod. Root guard blocks all BPDUs from port.",
          example: "show spanning-tree interface f0/2 (verify 'Guard: root') | No BPDUs → loop guard puts port in root-inconsistent (blocking)",
          advanced: "Combine guard options for defense-in-depth on core switches",
        },
        "EtherChannel - LACP (active)": {
          category: "etherchannel",
          command: "interface range g0/23-24\n channel-group 1 mode active\n description LAG1_TO_CORE\ninterface port-channel 1\n switchport mode trunk\n switchport trunk native vlan 199\n switchport trunk allowed vlan 10,20",
          explanation: "LACP (IEEE 802.3ad) negotiates bundle. Both sides 'active' = negotiated; one 'active' + one 'passive' OK. Bundles into logical port-channel.",
          warning: "Speed/duplex mismatch on individual links within bundle = bundle failure. All links must be identical.",
          example: "show etherchannel summary (shows 'Protocol: LACP' and member status) | Load-balance by default: source-dest MAC",
          advanced: "etherchannel load-balance method src-dst-ip (hash on IP for better distribution) | port-channel load-balance (global config)",
        },
        "EtherChannel - PAgP (legacy)": {
          category: "etherchannel",
          command: "interface range f0/23-24\n channel-group 2 mode desirable\ninterface port-channel 2\n switchport mode trunk",
          explanation: "PAgP is Cisco proprietary. Desirable + desirable = negotiated. Older than LACP but same function.",
          warning: "PAgP is deprecated. Use LACP for new deployments. Cisco supports both simultaneously on different bundles.",
          example: "show etherchannel 2 detail (shows 'Protocol: PagP' if configured)",
          advanced: "PAgP mode 'auto' rare in practice. Stick with 'desirable' or migrate to LACP",
        },
        "Port security - MAC limiting": {
          category: "port_security",
          command: "interface f0/1\n switchport mode access\n switchport access vlan 10\n switchport port-security\n switchport port-security maximum 2\n switchport port-security mac-address 0000.1111.1111\n switchport port-security mac-address sticky\n switchport port-security violation restrict",
          explanation: "Limits 2 MAC addresses. Sticky learns MACs dynamically. Violation 'restrict' drops offender traffic (no port shutdown).",
          warning: "Default violation is 'shutdown' (disables port completely). Restrict = logs but allows traffic. Choose based on tolerance.",
          example: "show port-security interface f0/1 (shows 'Max allowed: 2, Current: 2') | Sticky MACs saved to running-config",
          advanced: "violation protect (silent drop), restrict (drop + log), shutdown (port disabled). Sticky + aging: mac-address sticky aging time 60 (flush learned MACs after 60min)",
        },
        "DHCP snooping (anti-spoofing)": {
          category: "dhcp",
          command: "ip dhcp snooping\nip dhcp snooping vlan 10\ninterface f0/1\n ip dhcp snooping trust\ninterface range f0/2-24\n ip dhcp snooping limit rate 100",
          explanation: "Trusts DHCP server port (f0/1), untrusts all others. Limits 100 DHCP packets/sec/port (prevents exhaustion). Builds table of IP-MAC-lease bindings.",
          warning: "Untrustworthy DHCP requests blocked. If rogue DHCP needed for testing, temporarily trust port. Rate-limit prevents DoS.",
          example: "show ip dhcp snooping binding (shows learned IP-MAC mappings) | Rogue DHCP on untrusted port = dropped",
          advanced: "ip dhcp snooping information option (inserts option 82 into DHCP to track which switch port) | ip dhcp snooping verify mac-address",
        },
        "ARP inspection": {
          category: "port_security",
          command: "ip arp inspection vlan 10\nip arp inspection log-buffer logs 32\ninterface f0/1\n ip arp inspection trust\ninterface range f0/2-24\n ip arp inspection limit rate 100 burst interval 1",
          explanation: "Validates ARP requests against DHCP snooping table. Untrusted ports rate-limited. Prevents ARP spoofing (gratuitous ARP attacks).",
          warning: "DAI can block legitimate ARP (especially static IPs not in snooping table). Tune rate-limit to match normal ARP traffic.",
          example: "show ip arp inspection vlan 10 (shows blocked ARPs) | ARP for unlearned IP = dropped",
          advanced: "Dynamic ARP Inspection (DAI) + DHCP Snooping = prevents man-in-the-middle ARP attacks",
        },
        "IPv6 global unicast (GUA)": {
          category: "ipv6",
          command: "interface f0/1\n ipv6 address 2001:db8::1/64\n no shutdown\nshow ipv6 interface f0/1\nshow ipv6 neighbors",
          explanation: "2001:db8::/32 documentation prefix (RFC 3849). /64 is standard subnet. Link-local FE80:: auto-generated from MAC (EUI-64).",
          warning: "IPv6 autoconfig learns neighbors via NDP (replaces ARP). No DHCP needed for basic routing.",
          example: "show ipv6 interface brief (lists GUA + link-local) | Ping works with IPv6 addresses",
          advanced: "ipv6 address 2001:db8::/64 eui-64 (auto-generate from MAC) | ipv6 address fe80::1 link-local (manual link-local)",
        },
        "IPv6 static routing": {
          category: "ipv6",
          command: "ipv6 unicast-routing\nipv6 route 2001:db8:1::/48 2001:db8::2\nipv6 route ::/0 2001:db8::1\nshow ipv6 route",
          explanation: "Enable unicast-routing first. Default route ::/0. Static routes point to next-hop IPv6 address.",
          warning: "IPv6 requires explicit 'ipv6 unicast-routing'. No legacy forwarding.",
          example: "show ipv6 route (lists all IPv6 routes with next-hop) | traceroute works with IPv6",
          advanced: "IPv6 default route ::/0 for internet exit | EUI-64 auto-address generation per RFC 4291",
        },
        "NTP (Network Time Protocol)": {
          category: "ntp",
          command: "clock timezone PST -8\nip ntp server 10.0.1.100\nip ntp server 10.0.1.101 prefer\nntp authentication key 1 md5 NTP_KEY\nntp authenticate\nntp trusted-key 1\nshow clock\nshow ntp status",
          explanation: "Synchronizes time across network (critical for logs, SSH certs). Prefer option picks preferred server if multiple. Auth prevents time spoofing.",
          warning: "Clock skew breaks certificate validation (SSH, https). Always configure NTP in prod. Default stratum 16 (unsynchronized).",
          example: "show ntp associations (lists peers, reach status, delay) | synchronized message = good clock source",
          advanced: "Redundant NTP servers (3+ recommended) | NTP authentication optional but recommended | stratum tuning for precision network",
        },
        "Syslog configuration": {
          category: "snmp_logging",
          command: "logging 10.0.0.100\nlogging trap debugging\nlogging facility local0\nlogging queue-limit 100\nlogging buffered 51200\nshow logging\nterminal monitor",
          explanation: "Sends logs to syslog server 10.0.0.100. Trap debugging = severity 7 (debug level). Buffered logs saved in RAM for history.",
          warning: "Logging on every packet kills router CPU. Set appropriate level (errors > debug). Rate-limit if needed.",
          example: "show logging (shows current config + log buffer) | terminal monitor (real-time logs in SSH session)",
          advanced: "logging host 10.0.0.100 transport tcp port 1514 (reliable TCP syslog) | logging timestamp milliseconds (add ms to logs for precision)",
        },
        "SNMP v3 (secure)": {
          category: "snmp_logging",
          command: "snmp-server group SNMPV3_GROUP v3 auth\nsnmp-server user SNMP_USER SNMPV3_GROUP v3 auth sha SNMP_AUTH_PASS\nsnmp-server engineID remote 10.0.0.100 800007E5<engine-id>\nsnmp-server user remote-user v3 auth sha REMOTE_PASS\nshow snmp user",
          explanation: "SNMPv3 with authentication (SHA). No plain-text community strings. Engine ID for remote engines. Scalable for large networks.",
          warning: "SNMPv1/v2 community strings are plaintext (avoid). SNMPv3 requires trust relationship setup. Priv encryption optional (adds complexity).",
          example: "show snmp user (lists SNMP users & auth type) | Monitoring tools: only grant read-only community if needed",
          advanced: "Add privacy (encryption): 'auth sha' + 'priv aes 256' (encrypted SNMP) | Different engine IDs for remote SNMP over VPN",
        },
        "Wireless - WLC VLAN setup": {
          category: "wireless",
          command: "vlan 10\n name management\ninterface vlan 10\n ip address 192.168.10.1 255.255.255.0\nvlan 22\n name corporate\ninterface vlan 22\n ip address 192.168.22.1 255.255.255.0\nvlan 23\n name guest\ninterface vlan 23\n ip address 192.168.23.1 255.255.255.0",
          explanation: "Three VLANs: management (WLC), corporate (employees), guest (open). Each VLAN isolated for security.",
          warning: "Guest VLAN must have internet access but no internal access. Use ACL to isolate.",
          example: "show vlan brief (lists all 3 VLANs) | show ip interface brief | include vlan (shows VLAN IPs)",
          advanced: "Add VLAN 100 for AP management IP (if APs on separate VLAN from WLC)",
        },
        "Wireless - AP to switch trunk": {
          category: "wireless",
          command: "interface g1/0/5\n switchport trunk encapsulation dot1q\n switchport mode trunk\n switchport trunk allowed vlan 10,22,23\n spanning-tree portfast trunk\n no spanning-tree bpduguard",
          explanation: "Trunk carries all 3 VLANs (mgmt, corporate, guest). Portfast trunk speeds convergence (AP expects instant). No BPDU guard on AP links (AP not a switch).",
          warning: "If BPDU guard enabled + BPDU received from AP = port shutdown. Disable BPDU guard on AP link.",
          example: "show interfaces g1/0/5 switchport (verify 'Mode: trunk' and allowed VLANs)",
          advanced: "Quality of Service (QoS) on trunk: prioritize management traffic over user WLANs",
        },
      },
    },
    fortinet: {
      name: "Fortinet",
      description: "Fortinet FortiGate firewalls",
      icon: "🛡️",
      devices: ["FortiGate Firewall", "FortiSwitch", "FortiAP"],
      actions: {
        "Show interfaces": {
          command: "get interface physical",
          explanation: "Display all physical interfaces",
          warning: "Use 'get interface' for virtual interfaces",
          example: "port1: ip 192.168.1.1 255.255.255.0 (up)",
        },
        "Show firewall policies": {
          command: "show firewall policy",
          explanation: "Display all firewall security policies",
          warning: "Can be extensive. Use grep to filter.",
          example: "ID: 1, From: internal, To: external, Action: accept",
        },
        "Show routes": {
          command: "get router info routing-table all",
          explanation: "Display routing table",
          warning: "Includes all protocol routes",
          example: "S*  0.0.0.0/0 [10/0] via 192.168.1.254",
        },
        "Show logs": {
          command: "diagnose debug flow trace start 50",
          explanation: "Trace network traffic flow",
          warning: "Performance impact when tracing high volume",
          example: "id=20085 trace_id=1 msg_id=123",
        },
        "VPN status": {
          command: "get vpn ipsec tunnel name vpn_name",
          explanation: "Check VPN tunnel status",
          warning: "Replace vpn_name with actual tunnel",
          example: "up 1 seconds ago",
        },
      },
    },
    "palo-alto": {
      name: "Palo Alto",
      description: "Palo Alto Networks firewalls",
      icon: "🔴",
      devices: ["PA-Series Firewall", "Panorama"],
      actions: {
        "Show interfaces": {
          command: "show interface all",
          explanation: "Display all interfaces",
          warning: "Output format depends on model",
          example: "ethernet1/1: up (speed 1000, duplex full)",
        },
        "Show security policies": {
          command: "show predefined application",
          explanation: "Show predefined security policies",
          warning: "Use grep to filter specific policies",
          example: "app=ssh, service=tcp/22",
        },
        "Monitor sessions": {
          command: "show session all",
          explanation: "Display active sessions",
          warning: "Very verbose on busy firewalls",
          example: "ID: 123, Source: 192.168.1.10, Dest: 8.8.8.8",
        },
      },
    },
    juniper: {
      name: "Juniper",
      description: "Juniper Networks devices",
      icon: "🌳",
      devices: ["SRX Router", "MX Router", "Switch"],
      actions: {
        "Show interfaces": {
          command: "show interfaces terse",
          explanation: "Display interface summary",
          warning: "Use detailed for full output",
          example: "ge-0/0/0.0 up    up   inet 192.168.1.1",
        },
        "Show routes": {
          command: "show route table inet",
          explanation: "Display routing table",
          warning: "Separate tables for inet/inet6",
          example: "192.168.1.0/24 via ge-0/0/0.0",
        },
      },
    },
  },
};

/**
 * Get all platforms
 */
export function getPlatforms() {
  return Object.values(commandRegistry.platforms);
}

/**
 * Get platform by ID
 */
export function getPlatform(platformId) {
  return commandRegistry.platforms[platformId] || null;
}

/**
 * Get categories for a platform
 */
export function getPlatformCategories(platformId) {
  const platform = commandRegistry.platforms[platformId];
  return platform ? Object.values(platform.categories) : [];
}

/**
 * Get all vendors
 */
export function getVendors() {
  return Object.values(commandRegistry.vendors);
}

/**
 * Get vendor by ID
 */
export function getVendor(vendorId) {
  return commandRegistry.vendors[vendorId] || null;
}

/**
 * Get actions for a vendor
 */
export function getVendorActions(vendorId) {
  const vendor = commandRegistry.vendors[vendorId];
  return vendor
    ? Object.entries(vendor.actions).map(([label, data]) => ({
        label,
        ...data,
      }))
    : [];
}
