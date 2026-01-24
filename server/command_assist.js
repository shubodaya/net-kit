export const commandLibrary = [
  {
    id: "help",
    vendor: "any",
    title: "Command Assist topics",
    keywords: ["help", "topics", "list", "commands", "ccna"],
    response:
      "I can help with Cisco-style commands for: IOS basics, interfaces, routing (static/RIP/OSPF/EIGRP), VLANs/trunks/VTP, router-on-a-stick, DHCP, HSRP, STP, EtherChannel, port security, ACLs, NAT, IPv6, security, SNMP/syslog, and wireless fundamentals. Ask a specific topic.",
  },
  {
    id: "ios-basics",
    vendor: "cisco",
    title: "IOS basics",
    keywords: [
      "enable",
      "disable",
      "reload",
      "line con",
      "exec-timeout",
      "show run",
      "startup-config",
      "write erase",
      "config-register",
      "rommon",
      "hostname",
      "configure terminal",
      "ip host",
    ],
    response: `Cisco IOS basics:\n\n\
\`\`\`\n\
enable\n\
disable\n\
reload\n\
?\n\
line con 0\n\
 exec-timeout 30 0\n\
show run\n\
show startup-config\n\
write erase\n\
configure terminal\n\
ip host server1 1.1.1.1\n\
hostname R1\n\
config-register 0x2120\n\
rommon 1 > confreg 0x2142\n\
rommon 2 > reset\n\
config-register 0x2102\n\
\`\`\``,
  },
  {
    id: "show-commands",
    vendor: "cisco",
    title: "Show commands",
    keywords: [
      "show ip interface brief",
      "show ip protocols",
      "show interface",
      "show ip route",
      "show arp",
      "show flash",
    ],
    response: `Useful show commands:\n\n\
\`\`\`\n\
show ip interface brief\n\
show ip protocols\n\
show interface f0/0\n\
show ip route\n\
show arp\n\
show flash\n\
\`\`\``,
  },
  {
    id: "interface-basic",
    vendor: "cisco",
    title: "Interface config",
    keywords: ["interface", "ip address", "no shutdown", "description", "speed", "duplex"],
    response: `Interface config (Cisco IOS):\n\n\
\`\`\`\n\
interface f0/1\n\
 description link to sw1\n\
 ip address 10.10.20.1 255.255.255.0\n\
 no shutdown\n\
 speed 10\n\
 speed auto\n\
 duplex full\n\
 duplex half\n\
\`\`\``,
  },
  {
    id: "connectivity",
    vendor: "cisco",
    title: "Connectivity",
    keywords: ["ping", "traceroute", "telnet", "ssh"],
    response: `Connectivity tests:\n\n\
\`\`\`\n\
ping 10.10.10.10\n\
traceroute 10.10.10.10\n\
telnet 10.10.10.10\n\
ssh -l admin 10.10.10.10\n\
\`\`\``,
  },
  {
    id: "file-ops",
    vendor: "cisco",
    title: "Copy/flash",
    keywords: ["copy run start", "copy start run", "copy run tftp", "copy run flash", "delete flash", "tftpdnld"],
    response: `Config copy/flash:\n\n\
\`\`\`\n\
show run | begin hostname\n\
show run | exclude interface\n\
copy run start\n\
copy run flash\n\
copy run tftp\n\
show flash\n\
delete flash:c2900xxxxxxxxxx.binding\n\
rommon 1 > tftpdnld\n\
rommon 8 > reset\n\
\`\`\``,
  },
  {
    id: "loopback",
    vendor: "cisco",
    title: "Loopback",
    keywords: ["loopback"],
    response: `Loopback interface:\n\n\
\`\`\`\n\
interface loopback0\n\
 ip address 192.168.0.1 255.255.255.255\n\
 passive-interface loopback0\n\
\`\`\``,
  },
  {
    id: "dns",
    vendor: "cisco",
    title: "DNS",
    keywords: ["dns", "name-server", "domain-lookup"],
    response: `Router DNS config:\n\n\
\`\`\`\n\
ip domain-lookup\n\
ip name-server 10.10.10.10\n\
\`\`\``,
  },
  {
    id: "switch-basics",
    vendor: "cisco",
    title: "Switch basics",
    keywords: ["show version", "cdp", "show cdp neighbors"],
    response: `Switch basics:\n\n\
\`\`\`\n\
show version\n\
show cdp neighbors\n\
no cdp run\n\
cdp run\n\
interface f0/1\n\
 no cdp enable\n\
\`\`\``,
  },
  {
    id: "static-route",
    vendor: "cisco",
    title: "Static route",
    keywords: ["static route"],
    response: `Static route:\n\n\
\`\`\`\n\
ip route 10.1.0.0 255.255.255.0 10.0.0.2\n\
\`\`\``,
  },
  {
    id: "rip",
    vendor: "cisco",
    title: "RIP",
    keywords: ["rip"],
    response: `RIP v2:\n\n\
\`\`\`\n\
router rip\n\
 version 2\n\
 no auto-summary\n\
 network 10.0.0.0\n\
\`\`\`\n\nDebug:\n\n\
\`\`\`\n\
debug ip rip\n\
undebug all\n\
show ip rip database\n\
\`\`\``,
  },
  {
    id: "ospf",
    vendor: "cisco",
    title: "OSPF",
    keywords: ["ospf", "abr", "ospf neighbor", "ospf database"],
    response: `OSPF basic:\n\n\
\`\`\`\n\
router ospf 1\n\
 network 10.0.0.0 0.0.0.255 area 0\n\
\`\`\`\n\nABR example:\n\n\
\`\`\`\n\
router ospf 1\n\
 network 10.1.3.0 0.0.0.255 area 0\n\
 network 10.0.3.0 0.0.0.255 area 1\n\
 area 0 range 10.1.0.0 255.255.0.0\n\
 area 1 range 10.0.0.0 255.255.0.0\n\
\`\`\`\n\nCost/priority:\n\n\
\`\`\`\n\
auto-cost reference-bandwidth 100000\n\
interface f0/0\n\
 ip ospf cost 1500\n\
 bandwidth 768\n\
 ip ospf priority 100\n\
\`\`\`\n\nDefault info:\n\n\
\`\`\`\n\
ip route 0.0.0.0 0.0.0.0 203.0.113.2\n\
default-information originate\n\
\`\`\`\n\nShow:\n\n\
\`\`\`\n\
show ip ospf interface f0/0\n\
show ip ospf neighbor\n\
show ip ospf database\n\
\`\`\``,
  },
  {
    id: "eigrp",
    vendor: "cisco",
    title: "EIGRP",
    keywords: ["eigrp"],
    response: `EIGRP:\n\n\
\`\`\`\n\
router eigrp 100\n\
 no auto-summary\n\
 network 10.0.0.0 0.0.0.255\n\
\`\`\`\n\nShow:\n\n\
\`\`\`\n\
show ip eigrp neighbors\n\
\`\`\``,
  },
  {
    id: "vlan-vtp",
    vendor: "cisco",
    title: "VLAN/VTP",
    keywords: ["vlan", "vtp"],
    response: `VLAN/VTP:\n\n\
\`\`\`\n\
show vlan brief\n\
vtp domain flackbox\n\
vtp mode server\n\
vtp mode transparent\n\
vtp mode client\n\
vlan 10\n\
 name eng\n\
vlan 20\n\
 name sales\n\
vlan 199\n\
 name native\n\
\`\`\``,
  },
  {
    id: "trunk-access",
    vendor: "cisco",
    title: "Trunk/access",
    keywords: ["trunk", "access", "dot1q"],
    response: `Trunk/access:\n\n\
\`\`\`\n\
interface g0/1\n\
 switchport trunk encap dot1q\n\
 switchport mode trunk\n\
 switchport trunk native vlan 199\n\
 switchport trunk allowed vlan 10,11\n\
interface range f0/1-2\n\
 switchport mode access\n\
 switchport access vlan 10\n\
\`\`\``,
  },
  {
    id: "router-on-a-stick",
    vendor: "cisco",
    title: "Router-on-a-stick",
    keywords: ["router on a stick", "inter vlan"],
    response: `Router-on-a-stick:\n\n\
\`\`\`\n\
interface f0/0.10\n\
 encapsulation dot1q 10\n\
 ip address 10.10.10.1 255.255.255.0\n\
interface f0/0.20\n\
 encapsulation dot1q 20\n\
 ip address 10.10.20.1 255.255.255.0\n\
\`\`\``,
  },
  {
    id: "svi-routing",
    vendor: "cisco",
    title: "Layer 3 SVI",
    keywords: ["ip routing", "svi", "interface vlan"],
    response: `Layer 3 SVI routing:\n\n\
\`\`\`\n\
ip routing\n\
interface vlan 10\n\
 ip address 10.10.10.1 255.255.255.0\n\
interface vlan 20\n\
 ip address 10.10.20.1 255.255.255.0\n\
\`\`\``,
  },
  {
    id: "dhcp",
    vendor: "cisco",
    title: "DHCP",
    keywords: ["dhcp", "helper-address"],
    response: `DHCP client/server:\n\n\
\`\`\`\n\
interface f0/0\n\
 ip address dhcp\n\
 no shut\n\
show dhcp lease\n\
\`\`\`\n\nDHCP server:\n\n\
\`\`\`\n\
ip dhcp excluded-address 10.10.10.1 10.10.10.10\n\
ip dhcp pool flackbox\n\
 default-router 10.10.10.1\n\
 dns-server 10.10.20.10\n\
 network 10.10.10.0 255.255.255.0\n\
show ip dhcp binding\n\
\`\`\`\n\nHelper:\n\n\
\`\`\`\n\
interface f0/1\n\
 ip helper-address 10.10.20.10\n\
\`\`\``,
  },
  {
    id: "hsrp",
    vendor: "cisco",
    title: "HSRP",
    keywords: ["hsrp", "standby"],
    response: `HSRP:\n\n\
\`\`\`\n\
interface g0/1\n\
 standby 1 ip 10.10.10.1\n\
 standby 1 priority 110\n\
 standby 1 preempt\n\
show standby\n\
\`\`\``,
  },
  {
    id: "stp",
    vendor: "cisco",
    title: "STP",
    keywords: ["stp", "spanning-tree", "dtp", "portfast", "bpduguard", "rootguard", "loopguard"],
    response: `STP basics:\n\n\
\`\`\`\n\
show spanning-tree vlan 10\n\
spanning-tree mode rapid-pvst\n\
spanning-tree vlan 10 root primary\n\
spanning-tree vlan 10 root secondary\n\
spanning-tree pathcost method long\n\
interface f0/1\n\
 spanning-tree portfast\n\
 spanning-tree bpduguard enable\n\
\`\`\`\n\nDTP/port settings:\n\n\
\`\`\`\n\
switchport mode dynamic desirable\n\
switchport nonegotiate\n\
\`\`\`\n\nRecovery:\n\n\
\`\`\`\n\
errdisable recovery cause bpduguard\n\
errdisable recovery interval 30\n\
\`\`\``,
  },
  {
    id: "etherchannel",
    vendor: "cisco",
    title: "EtherChannel",
    keywords: ["etherchannel", "lacp", "pagp", "port-channel"],
    response: `EtherChannel:\n\n\
\`\`\`\n\
interface range f0/23-24\n\
 channel-group 1 mode active\n\
interface port-channel 1\n\
 switchport mode trunk\n\
 switchport trunk native vlan 199\n\
channel-group 2 mode desirable\n\
channel-group 3 mode on\n\
show etherchannel summary\n\
\`\`\``,
  },
  {
    id: "port-security",
    vendor: "cisco",
    title: "Port security",
    keywords: ["port security", "dhcp snooping", "arp inspection"],
    response: `Port security + snooping:\n\n\
\`\`\`\n\
interface f0/1\n\
 switchport mode access\n\
 switchport port-security\n\
 switchport port-security maximum 2\n\
 switchport port-security mac-address sticky\n\
ip dhcp snooping\n\
ip dhcp snooping vlan 10\n\
interface f0/1\n\
 ip dhcp snooping trust\n\
ip arp inspection vlan 10\n\
\`\`\`\n\nShow:\n\n\
\`\`\`\n\
show port-security interface f0/1\n\
show port-security address\n\
show mac address-table\n\
\`\`\``,
  },
  {
    id: "acl",
    vendor: "cisco",
    title: "ACL",
    keywords: ["acl", "access-list"],
    response: `ACL examples:\n\n\
\`\`\`\n\
access-list 1 deny 10.0.2.0 0.0.0.255\n\
access-list 1 permit 10.0.1.0 0.0.0.255\n\
interface f0/0\n\
 ip access-group 1 out\n\
access-list 100 permit tcp host 10.0.1.10 host 10.0.0.2 eq telnet\n\
access-list 100 deny tcp 10.0.1.0 0.0.0.255 host 10.0.0.2 eq telnet\n\
access-list 100 permit ip any any\n\
interface f1/0\n\
 ip access-group 100 in\n\
ip access-list standard F1/0_in_std\n\
 permit host 10.0.1.10\n\
 deny 10.0.1.0 0.0.0.255\n\
 permit any\n\
interface f1/0\n\
 ip access-group F1/0_in_std in\n\
ip access-list extended F1/0_in\n\
 permit tcp host 10.0.1.10 host 10.0.0.2 eq telnet\n\
 permit ip any any\n\
interface f1/0\n\
 ip access-group F1/0_in in\n\
show ip access-lists 100\n\
\`\`\``,
  },
  {
    id: "nat",
    vendor: "cisco",
    title: "NAT",
    keywords: ["nat", "overload"],
    response: `NAT examples:\n\n\
\`\`\`\n\
interface f0/0\n\
 ip nat outside\n\
interface f0/1\n\
 ip nat inside\n\
ip nat inside source static 10.0.1.10 203.0.113.3\n\
ip nat pool flackbox 203.0.113.4 203.0.113.12 netmask 255.255.255.240\n\
access-list 1 permit 10.0.2.0 0.0.0.255\n\
ip nat inside source list 1 pool flackbox\n\
ip nat inside source list 1 pool flackbox overload\n\
show ip nat translation\n\
show ip nat statistics\n\
\`\`\``,
  },
  {
    id: "vpn-ipsec",
    vendor: "cisco",
    title: "IPsec site-to-site (IOS)",
    keywords: ["vpn", "ipsec", "site to site", "isakmp", "crypto map", "transform set", "ike"],
    response: `IPsec site-to-site (Cisco IOS template):\n\n\
\`\`\`\n\
crypto isakmp policy 10\n\
 encr aes 256\n\
 hash sha256\n\
 authentication pre-share\n\
 group 14\n\
 lifetime 86400\n\
crypto isakmp key <PSK> address <PEER_IP>\n\
crypto ipsec transform-set TS esp-aes 256 esp-sha256-hmac\n\
crypto map VPN 10 ipsec-isakmp\n\
 set peer <PEER_IP>\n\
 set transform-set TS\n\
 match address VPN-TRAFFIC\n\
interface g0/0\n\
 crypto map VPN\n\
ip access-list extended VPN-TRAFFIC\n\
 permit ip 10.0.0.0 0.0.0.255 10.1.0.0 0.0.0.255\n\
\`\`\`\n\
Replace <PSK> and <PEER_IP> with your values.`,
  },
  {
    id: "vpn-ssl",
    vendor: "cisco",
    title: "SSL VPN (ASA template)",
    keywords: ["ssl vpn", "anyconnect", "webvpn", "asa"],
    response: `SSL VPN (Cisco ASA template):\n\n\
\`\`\`\n\
webvpn\n\
 enable outside\n\
 anyconnect image disk0:/anyconnect.pkg 1\n\
 tunnel-group-list enable\n\
group-policy GP internal\n\
group-policy GP attributes\n\
 vpn-tunnel-protocol ssl-client\n\
tunnel-group SSLVPN type remote-access\n\
tunnel-group SSLVPN general-attributes\n\
 default-group-policy GP\n\
tunnel-group SSLVPN webvpn-attributes\n\
 group-alias SSLVPN enable\n\
username user password <PASSWORD>\n\
\`\`\`\n\
If you want IOS XE or another vendor, tell me which platform.`,
  },
  {
    id: "ipv6",
    vendor: "cisco",
    title: "IPv6",
    keywords: ["ipv6"],
    response: `IPv6 basics:\n\n\
\`\`\`\n\
interface f0/1\n\
 ipv6 address 2001:db8::1/64\n\
 no shutdown\n\
interface f0/0\n\
 ipv6 address 2001:db8:0:1::1/64\n\
 no shutdown\n\
interface f0/0\n\
 ipv6 address 2001:db8:0:3::/64 eui-64\n\
 ipv6 address fe80::1 link-local\n\
ipv6 unicast-routing\n\
ipv6 route 2001:db8::/64 2001:db8:0:2::1\n\
ipv6 route ::/0 2001:db8::1\n\
show ipv6 interface brief\n\
show ipv6 neighbors\n\
show ipv6 route\n\
\`\`\``,
  },
  {
    id: "security",
    vendor: "cisco",
    title: "Security",
    keywords: ["enable password", "enable secret", "service password-encryption", "banner", "vty", "ssh", "telnet"],
    response: `Security basics:\n\n\
\`\`\`\n\
enable password flackbox2\n\
enable secret flackbox1\n\
service password-encryption\n\
line console 0\n\
 exec-timeout 15\n\
line vty 0 15\n\
 exec-timeout 15\n\
access-list 1 permit host 10.0.0.10\n\
line vty 0 15\n\
 login\n\
 password flackbox3\n\
 access-class 1 in\n\
banner login "Authorised users only"\n\
username admin secret flackbox4\n\
line vty 0 15\n\
 login local\n\
ip domain-name flackbox.com\n\
crypto key generate rsa\n\
line vty 0 15\n\
 transport input ssh\n\
ip ssh version 2\n\
ssh -l admin 10.0.0.1\n\
\`\`\``,
  },
  {
    id: "management",
    vendor: "cisco",
    title: "NTP/SNMP/Syslog",
    keywords: ["ntp", "snmp", "syslog", "logging"],
    response: `Management:\n\n\
\`\`\`\n\
clock timezone PST -8\n\
ntp server 10.0.1.100\n\
show clock\n\
show ntp status\n\
snmp-server community flackbox1 ro\n\
snmp-server community flackbox2 rw\n\
logging 10.0.0.100\n\
logging trap debugging\n\
show logging\n\
terminal monitor\n\
\`\`\``,
  },
  {
    id: "wireless",
    vendor: "cisco",
    title: "Wireless fundamentals",
    keywords: ["wireless", "wlc", "ssid"],
    response: `Wireless fundamentals (switch side):\n\n\
\`\`\`\n\
vlan 10\n\
 name management\n\
interface vlan 10\n\
 ip address 192.168.10.1 255.255.255.0\n\
vlan 22\n\
 name corporate\n\
interface vlan 22\n\
 ip address 192.168.22.1 255.255.255.0\n\
vlan 23\n\
 name guest\n\
interface vlan 23\n\
 ip address 192.168.23.1 255.255.255.0\n\
interface g1/0/5\n\
 switchport trunk encapsulation dot1q\n\
 switchport mode trunk\n\
 switchport trunk allowed vlan 10,22,23\n\
 spanning-tree portfast trunk\n\
interface range g1/0/3-4\n\
 switchport mode access\n\
 switchport access vlan 10\n\
 spanning-tree portfast\n\
show vlan brief\n\
show ip interface brief | include vlan\n\
\`\`\``,
  },
  {
    id: "junos-basics",
    vendor: "juniper",
    title: "JunOS basics",
    keywords: ["juniper", "junos", "show configuration", "set system host-name", "commit"],
    response: `JunOS basics:\n\n\
\`\`\`\n\
cli\n\
configure\n\
set system host-name R1\n\
show configuration | display set\n\
commit\n\
exit\n\
\`\`\``,
  },
  {
    id: "junos-interface",
    vendor: "juniper",
    title: "JunOS interface",
    keywords: ["juniper interface", "set interfaces", "ge-0/0/0", "unit 0", "family inet"],
    response: `JunOS interface config:\n\n\
\`\`\`\n\
configure\n\
set interfaces ge-0/0/0 unit 0 family inet address 10.10.20.1/24\n\
set interfaces ge-0/0/0 description \"link to sw1\"\n\
commit\n\
\`\`\``,
  },
  {
    id: "junos-ospf",
    vendor: "juniper",
    title: "JunOS OSPF",
    keywords: ["juniper ospf", "set protocols ospf", "area 0"],
    response: `JunOS OSPF:\n\n\
\`\`\`\n\
configure\n\
set protocols ospf area 0 interface ge-0/0/0.0\n\
commit\n\
\`\`\``,
  },
  {
    id: "junos-bgp",
    vendor: "juniper",
    title: "JunOS BGP",
    keywords: ["juniper bgp", "set protocols bgp", "peer-as"],
    response: `JunOS BGP:\n\n\
\`\`\`\n\
configure\n\
set protocols bgp group EBGP type external\n\
set protocols bgp group EBGP neighbor 203.0.113.2 peer-as 65002\n\
commit\n\
\`\`\``,
  },
  {
    id: "junos-vlan",
    vendor: "juniper",
    title: "JunOS VLAN",
    keywords: ["juniper vlan", "set vlans", "vlan-id"],
    response: `JunOS VLAN:\n\n\
\`\`\`\n\
configure\n\
set vlans STAFF vlan-id 20\n\
set interfaces ge-0/0/1 unit 0 family ethernet-switching vlan members STAFF\n\
commit\n\
\`\`\``,
  },
  {
    id: "mikrotik-basics",
    vendor: "mikrotik",
    title: "MikroTik basics",
    keywords: ["mikrotik", "routeros", "/system identity", "/export"],
    response: `MikroTik basics:\n\n\
\`\`\`\n\
/system identity set name=R1\n\
/export\n\
\`\`\``,
  },
  {
    id: "mikrotik-interface",
    vendor: "mikrotik",
    title: "MikroTik interface",
    keywords: ["mikrotik ip address", "/ip address add", "ether1"],
    response: `MikroTik IP address:\n\n\
\`\`\`\n\
/ip address add address=10.10.20.1/24 interface=ether1\n\
\`\`\``,
  },
  {
    id: "mikrotik-ospf",
    vendor: "mikrotik",
    title: "MikroTik OSPF",
    keywords: ["mikrotik ospf", "/routing ospf"],
    response: `MikroTik OSPF:\n\n\
\`\`\`\n\
/routing ospf instance add name=ospf1 router-id=1.1.1.1\n\
/routing ospf area add name=backbone area-id=0.0.0.0\n\
/routing ospf interface-template add interfaces=ether1 area=backbone\n\
\`\`\``,
  },
  {
    id: "mikrotik-vlan",
    vendor: "mikrotik",
    title: "MikroTik VLAN",
    keywords: ["mikrotik vlan", "/interface vlan"],
    response: `MikroTik VLAN:\n\n\
\`\`\`\n\
/interface vlan add name=vlan20 vlan-id=20 interface=ether1\n\
\`\`\``,
  },
  {
    id: "mikrotik-dhcp",
    vendor: "mikrotik",
    title: "MikroTik DHCP",
    keywords: ["mikrotik dhcp", "/ip dhcp-server"],
    response: `MikroTik DHCP server:\n\n\
\`\`\`\n\
/ip pool add name=pool1 ranges=10.10.10.10-10.10.10.100\n\
/ip dhcp-server add name=dhcp1 interface=ether1 address-pool=pool1\n\
/ip dhcp-server network add address=10.10.10.0/24 gateway=10.10.10.1 dns-server=8.8.8.8\n\
\`\`\``,
  },
  {
    id: "arista-basics",
    vendor: "arista",
    title: "Arista EOS basics",
    keywords: ["arista", "eos", "show running-config", "hostname"],
    response: `Arista EOS basics:\n\n\
\`\`\`\n\
enable\n\
configure terminal\n\
hostname R1\n\
show running-config\n\
\`\`\``,
  },
  {
    id: "arista-interface",
    vendor: "arista",
    title: "Arista interface",
    keywords: ["arista interface", "ethernet1", "no shutdown", "ip address"],
    response: `Arista interface config:\n\n\
\`\`\`\n\
interface Ethernet1\n\
 description link to sw1\n\
 ip address 10.10.20.1/24\n\
 no shutdown\n\
\`\`\``,
  },
  {
    id: "arista-ospf",
    vendor: "arista",
    title: "Arista OSPF",
    keywords: ["arista ospf", "router ospf"],
    response: `Arista OSPF:\n\n\
\`\`\`\n\
router ospf 1\n\
 network 10.10.20.0/24 area 0\n\
\`\`\``,
  },
  {
    id: "arista-bgp",
    vendor: "arista",
    title: "Arista BGP",
    keywords: ["arista bgp", "router bgp"],
    response: `Arista BGP:\n\n\
\`\`\`\n\
router bgp 65001\n\
 neighbor 203.0.113.2 remote-as 65002\n\
 network 10.10.0.0/16\n\
\`\`\``,
  },
  {
    id: "linux-networking",
    vendor: "any",
    title: "Linux networking",
    keywords: ["linux", "ip addr", "ip route", "ss", "ping", "traceroute", "curl"],
    response: `Linux networking basics:\n\n\
\`\`\`\n\
ip addr show\n\
ip route show\n\
ss -tulpn\n\
ping -c 4 8.8.8.8\n\
traceroute 8.8.8.8\n\
curl -I https://example.com\n\
\`\`\``,
  },
  {
    id: "linux-logs",
    vendor: "any",
    title: "Linux logs",
    keywords: ["journalctl", "syslog", "logs", "dmesg", "tail -f"],
    response: `Linux logs:\n\n\
\`\`\`\n\
journalctl -xe\n\
tail -f /var/log/syslog\n\
dmesg | tail -n 50\n\
grep -i error /var/log/syslog\n\
\`\`\``,
  },
  {
    id: "linux-hash",
    vendor: "any",
    title: "Linux file hash",
    keywords: ["sha256sum", "md5sum", "hash file"],
    response: `Linux file hashing:\n\n\
\`\`\`\n\
sha256sum file.bin\n\
md5sum file.bin\n\
\`\`\``,
  },
  {
    id: "linux-services",
    vendor: "any",
    title: "Linux services",
    keywords: ["systemctl", "service status", "restart service"],
    response: `Linux services:\n\n\
\`\`\`\n\
systemctl status ssh\n\
systemctl restart ssh\n\
systemctl enable ssh\n\
\`\`\``,
  },
  {
    id: "powershell-networking",
    vendor: "any",
    title: "PowerShell networking",
    keywords: ["powershell", "get-nettcpconnection", "test-connection", "resolve-dnsname"],
    response: `PowerShell networking:\n\n\
\`\`\`\n\
Test-Connection 8.8.8.8 -Count 4\n\
Get-NetTCPConnection -State Listen\n\
Resolve-DnsName example.com\n\
\`\`\``,
  },
  {
    id: "powershell-processes",
    vendor: "any",
    title: "PowerShell processes/services",
    keywords: ["get-process", "get-service", "stop-process", "restart-service"],
    response: `PowerShell processes/services:\n\n\
\`\`\`\n\
Get-Process | Sort-Object CPU -Descending | Select-Object -First 5\n\
Get-Service | Where-Object {$_.Status -eq \"Running\"}\n\
Restart-Service -Name Spooler\n\
\`\`\``,
  },
  {
    id: "powershell-hash",
    vendor: "any",
    title: "PowerShell file hash",
    keywords: ["get-filehash", "file hash", "sha256"],
    response: `PowerShell file hashing:\n\n\
\`\`\`\n\
Get-FileHash -Algorithm SHA256 .\\file.bin\n\
\`\`\``,
  },
  {
    id: "bash-tools",
    vendor: "any",
    title: "Bash tools",
    keywords: ["bash", "grep", "awk", "sed", "find", "tar"],
    response: `Bash basics:\n\n\
\`\`\`\n\
grep -R \"error\" /var/log\n\
awk '{print $1}' file.txt\n\
sed -n '1,10p' file.txt\n\
find . -type f -name \"*.log\"\n\
tar -czf backup.tgz /etc\n\
\`\`\``,
  },
  {
    id: "bash-networking",
    vendor: "any",
    title: "Bash networking",
    keywords: ["bash network", "ss -tulpn", "iptables", "nc", "curl"],
    response: `Bash networking:\n\n\
\`\`\`\n\
ss -tulpn\n\
iptables -L -n\n\
nc -vz 10.0.0.10 22\n\
curl -I https://example.com\n\
\`\`\``,
  },
];
