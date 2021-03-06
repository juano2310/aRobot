module.exports =
	ssid: process.env.PORTAL_SSID or 'Raspberry Pi Hotspot'
	passphrase: process.env.PORTAL_PASSPHRASE
	iface: process.env.PORTAL_INTERFACE or 'wlan0'
	gateway: process.env.PORTAL_GATEWAY or '192.168.23.1'
	dhcpRange: process.env.PORTAL_DHCP_RANGE or '192.168.23.2,192.168.23.254'
	connmanConfig: process.env.PORTAL_CONNMAN_CONFIG or '/var/lib/connman/network.config'
	persistentConfig: process.env.PORTAL_PERSISTENT_CONFIG or '/home/pi/network.config'
