import type { UtilityTemplate } from "./command-generator"
import { CommandValidator } from "./command-validator"

export const advancedUtilities: UtilityTemplate[] = [
  {
    id: "file-permissions-audit",
    name: "File Permissions Audit",
    description: "Find files with specific permissions or ownership issues",
    category: "security",
    dangerLevel: "safe",
    inputs: [
      {
        name: "searchPath",
        label: "Search Path",
        placeholder: "/usr/sap",
        defaultValue: "/usr/sap",
        required: true,
        helpText: "Directory to search for permission issues",
        validator: CommandValidator.validatePath,
      },
      {
        name: "permissionType",
        label: "Permission Type",
        type: "select",
        options: ["world-writable", "setuid", "setgid", "no-owner", "executable"],
        defaultValue: "world-writable",
        helpText: "Type of permission issue to find",
      },
    ],
    commandTemplate:
      "find {searchPath} {permissionType|world-writable:-perm -002|setuid:-perm -4000|setgid:-perm -2000|no-owner:-nouser -o -nogroup|executable:-perm -111} -type f 2>/dev/null | head -20",
    examples: [
      "find /usr/sap -perm -002 -type f 2>/dev/null | head -20",
      "find /usr/sap -perm -4000 -type f 2>/dev/null | head -20",
      "find /usr/sap -nouser -o -nogroup -type f 2>/dev/null | head -20",
    ],
    notes: ["Limited to 20 results for performance", "May require elevated privileges for some directories"],
  },
  {
    id: "log-rotation-check",
    name: "Log Rotation Status",
    description: "Check log rotation configuration and status",
    category: "maintenance",
    dangerLevel: "safe",
    inputs: [
      {
        name: "logPath",
        label: "Log Directory",
        placeholder: "/var/log",
        defaultValue: "/var/log",
        required: true,
        helpText: "Directory containing logs to check",
        validator: CommandValidator.validatePath,
      },
    ],
    commandTemplate:
      "ls -la {logPath}/*.log* 2>/dev/null | head -10 && echo '--- Logrotate Status ---' && logrotate -d /etc/logrotate.conf 2>&1 | grep -A5 -B5 {logPath}",
    examples: [
      "ls -la /var/log/*.log* 2>/dev/null | head -10 && echo '--- Logrotate Status ---' && logrotate -d /etc/logrotate.conf 2>&1 | grep -A5 -B5 /var/log",
    ],
    notes: ["Shows log files and rotation configuration", "Dry-run mode for logrotate check"],
  },
  {
    id: "duplicate-files",
    name: "Find Duplicate Files",
    description: "Find duplicate files based on size and checksum",
    category: "maintenance",
    dangerLevel: "caution",
    inputs: [
      {
        name: "searchPath",
        label: "Search Path",
        placeholder: "/home",
        defaultValue: "/home",
        required: true,
        helpText: "Directory to search for duplicates",
        validator: CommandValidator.validatePath,
      },
      {
        name: "minSize",
        label: "Minimum File Size (MB)",
        placeholder: "10",
        defaultValue: "10",
        helpText: "Only check files larger than this size",
        validator: (value) => CommandValidator.validateNumber(value, 1, 1000),
      },
    ],
    commandTemplate:
      "find {searchPath} -type f -size +{minSize}M -exec md5sum {} \\; 2>/dev/null | sort | uniq -d -w32",
    examples: [
      "find /home -type f -size +10M -exec md5sum {} \\; 2>/dev/null | sort | uniq -d -w32",
      "find /usr/sap -type f -size +50M -exec md5sum {} \\; 2>/dev/null | sort | uniq -d -w32",
    ],
    notes: ["May take significant time on large directories", "Only shows files with identical checksums"],
  },
  {
    id: "system-resource-monitor",
    name: "System Resource Monitor",
    description: "Comprehensive system resource monitoring",
    category: "monitoring",
    dangerLevel: "safe",
    inputs: [
      {
        name: "duration",
        label: "Monitor Duration (seconds)",
        placeholder: "60",
        defaultValue: "60",
        helpText: "How long to monitor system resources",
        validator: (value) => CommandValidator.validateNumber(value, 10, 3600),
      },
      {
        name: "interval",
        label: "Sample Interval (seconds)",
        placeholder: "5",
        defaultValue: "5",
        helpText: "How often to sample resources",
        validator: (value) => CommandValidator.validateNumber(value, 1, 60),
      },
    ],
    commandTemplate:
      "echo 'Starting {duration}s monitoring with {interval}s intervals...' && for i in $(seq 1 $((({duration})/{interval}))); do echo '--- Sample $i ---'; top -bn1 | head -5; free -h; df -h | head -5; sleep {interval}; done",
    examples: [
      "echo 'Starting 60s monitoring with 5s intervals...' && for i in $(seq 1 $((60/5))); do echo '--- Sample $i ---'; top -bn1 | head -5; free -h; df -h | head -5; sleep 5; done",
    ],
    notes: ["Provides periodic snapshots of system resources", "Use Ctrl+C to stop early"],
  },
  {
    id: "network-diagnostics",
    name: "Network Diagnostics",
    description: "Comprehensive network connectivity and performance check",
    category: "network",
    dangerLevel: "safe",
    inputs: [
      {
        name: "targetHost",
        label: "Target Host",
        placeholder: "google.com",
        defaultValue: "google.com",
        required: true,
        helpText: "Host to test connectivity to",
      },
      {
        name: "includeTrace",
        label: "Include Traceroute",
        type: "select",
        options: ["yes", "no"],
        defaultValue: "no",
        helpText: "Whether to include traceroute information",
      },
    ],
    commandTemplate:
      "echo '--- Network Interface Status ---' && ip addr show | grep -E '^[0-9]|inet ' && echo '--- Ping Test ---' && ping -c 4 {targetHost} && echo '--- DNS Resolution ---' && nslookup {targetHost}{includeTrace|yes: && echo '--- Traceroute ---' && traceroute {targetHost}|}",
    examples: [
      "echo '--- Network Interface Status ---' && ip addr show | grep -E '^[0-9]|inet ' && echo '--- Ping Test ---' && ping -c 4 google.com && echo '--- DNS Resolution ---' && nslookup google.com",
      "echo '--- Network Interface Status ---' && ip addr show | grep -E '^[0-9]|inet ' && echo '--- Ping Test ---' && ping -c 4 google.com && echo '--- DNS Resolution ---' && nslookup google.com && echo '--- Traceroute ---' && traceroute google.com",
    ],
    notes: ["Tests basic network connectivity and DNS", "Traceroute may take additional time"],
  },
  {
    id: "backup-verification",
    name: "Backup Verification",
    description: "Verify backup files and check integrity",
    category: "maintenance",
    dangerLevel: "safe",
    inputs: [
      {
        name: "backupPath",
        label: "Backup Directory",
        placeholder: "/backup",
        required: true,
        helpText: "Directory containing backup files",
        validator: CommandValidator.validatePath,
      },
      {
        name: "filePattern",
        label: "Backup File Pattern",
        placeholder: "*.bak",
        defaultValue: "*.bak",
        helpText: "Pattern to match backup files",
      },
      {
        name: "maxAge",
        label: "Maximum Age (days)",
        placeholder: "7",
        defaultValue: "7",
        helpText: "Alert if backups are older than this",
        validator: (value) => CommandValidator.validateNumber(value, 1, 365),
      },
    ],
    commandTemplate:
      "echo '--- Recent Backup Files ---' && find {backupPath} -name '{filePattern}' -mtime -{maxAge} -ls 2>/dev/null && echo '--- Old Backup Files (>{maxAge} days) ---' && find {backupPath} -name '{filePattern}' -mtime +{maxAge} -ls 2>/dev/null && echo '--- Backup Directory Size ---' && du -sh {backupPath} 2>/dev/null",
    examples: [
      "echo '--- Recent Backup Files ---' && find /backup -name '*.bak' -mtime -7 -ls 2>/dev/null && echo '--- Old Backup Files (>7 days) ---' && find /backup -name '*.bak' -mtime +7 -ls 2>/dev/null && echo '--- Backup Directory Size ---' && du -sh /backup 2>/dev/null",
    ],
    notes: ["Shows both recent and old backup files", "Helps identify backup retention issues"],
  },
  {
    id: "system-cleanup-analysis",
    name: "System Cleanup Analysis",
    description: "Identify files and directories that can be cleaned up",
    category: "maintenance",
    dangerLevel: "caution",
    inputs: [
      {
        name: "analysisType",
        label: "Analysis Type",
        type: "select",
        options: ["temp-files", "old-logs", "cache-files", "core-dumps", "all"],
        defaultValue: "temp-files",
        helpText: "Type of cleanup analysis to perform",
      },
      {
        name: "ageThreshold",
        label: "Age Threshold (days)",
        placeholder: "30",
        defaultValue: "30",
        helpText: "Files older than this will be identified",
        validator: (value) => CommandValidator.validateNumber(value, 1, 365),
      },
    ],
    commandTemplate:
      "echo '--- Cleanup Analysis: {analysisType} ---' && {analysisType|temp-files:find /tmp /var/tmp -type f -mtime +{ageThreshold} -ls 2>/dev/null | head -20|old-logs:find /var/log -name '*.log.*' -o -name '*.gz' -mtime +{ageThreshold} -ls 2>/dev/null | head -20|cache-files:find /var/cache -type f -mtime +{ageThreshold} -ls 2>/dev/null | head -20|core-dumps:find / -name 'core.*' -o -name '*.core' -mtime +{ageThreshold} -ls 2>/dev/null|all:echo 'Temp Files:' && find /tmp /var/tmp -type f -mtime +{ageThreshold} -ls 2>/dev/null | head -10 && echo 'Old Logs:' && find /var/log -name '*.log.*' -o -name '*.gz' -mtime +{ageThreshold} -ls 2>/dev/null | head -10}",
    examples: [
      "echo '--- Cleanup Analysis: temp-files ---' && find /tmp /var/tmp -type f -mtime +30 -ls 2>/dev/null | head -20",
      "echo '--- Cleanup Analysis: old-logs ---' && find /var/log -name '*.log.*' -o -name '*.gz' -mtime +30 -ls 2>/dev/null | head -20",
    ],
    notes: ["ANALYSIS ONLY - does not delete files", "Review results carefully before any cleanup"],
  },
  {
    id: "certificate-expiry-check",
    name: "Certificate Expiry Check",
    description: "Check SSL/TLS certificate expiration dates",
    category: "security",
    dangerLevel: "safe",
    inputs: [
      {
        name: "certPath",
        label: "Certificate Directory",
        placeholder: "/etc/ssl/certs",
        defaultValue: "/etc/ssl/certs",
        required: true,
        helpText: "Directory containing certificate files",
        validator: CommandValidator.validatePath,
      },
      {
        name: "warningDays",
        label: "Warning Threshold (days)",
        placeholder: "30",
        defaultValue: "30",
        helpText: "Warn if certificates expire within this many days",
        validator: (value) => CommandValidator.validateNumber(value, 1, 365),
      },
    ],
    commandTemplate:
      "echo '--- Certificate Expiry Check ---' && find {certPath} -name '*.crt' -o -name '*.pem' | while read cert; do echo \"Checking: $cert\"; openssl x509 -in \"$cert\" -noout -dates 2>/dev/null || echo \"Error reading certificate\"; echo '---'; done | head -50",
    examples: [
      "echo '--- Certificate Expiry Check ---' && find /etc/ssl/certs -name '*.crt' -o -name '*.pem' | while read cert; do echo \"Checking: $cert\"; openssl x509 -in \"$cert\" -noout -dates 2>/dev/null || echo \"Error reading certificate\"; echo '---'; done | head -50",
    ],
    notes: ["Checks certificate validity dates", "Limited to 50 certificates for performance"],
  },
]
