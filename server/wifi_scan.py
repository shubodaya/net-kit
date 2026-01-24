import json
import time


def respond(payload):
    print(json.dumps(payload))


def scan_with_pywifi():
    try:
        import pywifi
        from pywifi import const
    except Exception as exc:
        return {
            "ok": False,
            "error": f"pywifi import failed: {exc}. Run: python -m pip install pywifi comtypes",
        }

    wifi = pywifi.PyWiFi()
    interfaces = wifi.interfaces()
    if not interfaces:
        return {"ok": False, "error": "No Wi-Fi interfaces found."}

    iface = interfaces[0]
    iface.scan()
    time.sleep(3)
    results = iface.scan_results()
    networks = {}

    for profile in results:
        ssid = profile.ssid or "Hidden"
        signal = profile.signal
        bssid = profile.bssid
        freq = profile.freq
        akm = profile.akm or []
        auth = profile.auth
        cipher = profile.cipher

        if const.AKM_TYPE_NONE in akm:
            security = "Open"
        elif const.AKM_TYPE_WPA2PSK in akm:
            security = "WPA2-PSK"
        elif const.AKM_TYPE_WPA in akm:
            security = "WPA"
        elif const.AKM_TYPE_WPA3PSK in akm:
            security = "WPA3-PSK"
        else:
            security = "Unknown"

        networks[(ssid, bssid)] = {
            "ssid": ssid,
            "bssid": bssid,
            "signal": signal,
            "frequency": freq,
            "security": security,
            "auth": auth,
            "cipher": cipher,
        }

    payload = {
        "ok": True,
        "timestamp": int(time.time()),
        "networks": sorted(networks.values(), key=lambda n: n.get("signal", 0), reverse=True),
    }
    return payload


def main():
    payload = scan_with_pywifi()
    respond(payload)


if __name__ == "__main__":
    main()
