import { CommandValidator } from "./command-validator"
import type { UtilityTemplate } from "./command-generator"
import { HardDrive, FileText, Settings, Database, Monitor, Network, Shield, Search } from "lucide-react"

export const utilityTemplates: UtilityTemplate[] = [
  {
    id: "directory-size",
    name: "Directory Size Analysis",
    description: "List sizes of directories and files, sorted by size",
    category: "filesystem",
    dangerLevel: "safe",
    inputs: [
      {
        name: "directory",
        label: "Directory Path",
        placeholder: "/hana/shared",
        defaultValue: "/",
        required: true,
        helpText: "Absolute path to the directory you want to analyze",
        validator: CommandValidator.validatePath,
      },
    ],
    commandTemplate: "du -hca {directory} | sort -h",
    examples: ["du -hca /hana/shared | sort -h", "du -hca /var/log | sort -h", "du -hca /usr/sap | sort -h"],
    notes: ["This command may take time on large directories", "Results are sorted from smallest to largest"],
  },
  {
    id: "find-files",
    name: "Find Files by Pattern",
    description: "Search for files matching a specific pattern",
    category: "filesystem",
    dangerLevel: "safe",
    inputs: [
      {
        name: "startPath",
        label: "Starting Path",
        placeholder: "/",
        defaultValue: "/",
        required: true,
        helpText: "Directory to start the search from",
        validator: CommandValidator.validatePath,
      },
      {
        name: "pattern",
        label: "File Pattern",
        placeholder: "bck_*",
        required: true,
        helpText: "Use wildcards like * and ? to match file names",
        validator: CommandValidator.validatePattern,
      },
    ],
    commandTemplate: "find {startPath} -type f -name {pattern} 2>/dev/null",
    examples: [
      "find / -type f -name 'bck_*' 2>/dev/null",
      "find /var/log -type f -name '*.log' 2>/dev/null",
      "find /usr/sap -type f -name '*.trc' 2>/dev/null",
    ],
    notes: ["Errors are suppressed with 2>/dev/null", "Use quotes around patterns with special characters"],
  },
  {
    id: "disk-overview",
    name: "Disk Usage Overview",
    description: "Show disk usage and mount points",
    category: "system",
    dangerLevel: "safe",
    inputs: [],
    commandTemplate: 'df -h && echo "\\n--- Block Devices ---" && lsblk',
    examples: ['df -h && echo "\\n--- Block Devices ---" && lsblk'],
    notes: ["Shows both filesystem usage and block device information"],
  },
  {
    id: "largest-files",
    name: "Largest Files in Directory",
    description: "Find the largest files in a directory",
    category: "filesystem",
    dangerLevel: "safe",
    inputs: [
      {
        name: "directory",
        label: "Directory Path",
        placeholder: "/var/log",
        defaultValue: "/var/log",
        required: true,
        helpText: "Directory to search for large files",
        validator: CommandValidator.validatePath,
      },
      {
        name: "count",
        label: "Number of Files",
        placeholder: "10",
        defaultValue: "10",
        required: true,
        helpText: "How many of the largest files to show",
        validator: (value) => CommandValidator.validateNumber(value, 1, 100),
      },
    ],
    commandTemplate: "find {directory} -type f -printf '%s %p\\n' | sort -nr | head -n {count} | numfmt --to=human",
    examples: [
      "find /var/log -type f -printf '%s %p\\n' | sort -nr | head -n 10 | numfmt --to=human",
      "find /usr/sap -type f -printf '%s %p\\n' | sort -nr | head -n 20 | numfmt --to=human",
    ],
    notes: ["Results show file size in human-readable format", "Sorted from largest to smallest"],
  },
  {
    id: "log-search",
    name: "Log File Search",
    description: "Search for keywords in log files",
    category: "logs",
    dangerLevel: "safe",
    inputs: [
      {
        name: "keyword",
        label: "Search Keyword",
        placeholder: "ERROR",
        required: true,
        helpText: "Text to search for in log files",
        validator: CommandValidator.validateKeyword,
      },
      {
        name: "logDir",
        label: "Log Directory",
        placeholder: "/var/log",
        defaultValue: "/var/log",
        required: true,
        helpText: "Directory containing log files to search",
        validator: CommandValidator.validatePath,
      },
      {
        name: "caseSensitive",
        label: "Case Sensitive",
        type: "select",
        options: ["no", "yes"],
        defaultValue: "no",
        helpText: "Whether the search should be case sensitive",
      },
    ],
    commandTemplate: "grep -R{caseSensitive|no:-i}n {keyword} {logDir} 2>/dev/null",
    examples: [
      "grep -RIn ERROR /var/log 2>/dev/null",
      "grep -Rn ERROR /var/log 2>/dev/null",
      "grep -RIn HANA /usr/sap 2>/dev/null",
    ],
    notes: ["Case insensitive by default", "Shows line numbers and file names"],
  },
  {
    id: "service-status",
    name: "Service Status Check",
    description: "Check the status of system services",
    category: "system",
    dangerLevel: "safe",
    inputs: [
      {
        name: "serviceName",
        label: "Service Name",
        placeholder: "sapb1",
        required: true,
        helpText: "Name of the systemd service to check",
        validator: CommandValidator.validateServiceName,
      },
    ],
    commandTemplate: "systemctl status {serviceName}",
    examples: ["systemctl status sapb1", "systemctl status hdb", "systemctl status postgresql"],
    notes: ["Shows detailed service status including recent logs"],
  },
  {
    id: "process-monitor",
    name: "Process Monitor",
    description: "Monitor system processes with filtering",
    category: "system",
    dangerLevel: "safe",
    inputs: [
      {
        name: "processFilter",
        label: "Process Filter",
        placeholder: "hdb",
        helpText: "Filter processes by name (optional)",
      },
      {
        name: "sortBy",
        label: "Sort By",
        type: "select",
        options: ["cpu", "memory", "pid", "time"],
        defaultValue: "cpu",
        helpText: "How to sort the process list",
      },
    ],
    commandTemplate: "ps aux{processFilter| | grep {processFilter}} | sort -k{sortBy|cpu:3|memory:4|pid:2|time:10} -nr",
    examples: ["ps aux | grep hdb | sort -k3 -nr", "ps aux | sort -k3 -nr", "ps aux | grep sap | sort -k4 -nr"],
    notes: ["Shows all processes with CPU and memory usage", "Sorted by specified criteria"],
  },
  {
    id: "network-connections",
    name: "Network Connections",
    description: "Show network connections and listening ports",
    category: "network",
    dangerLevel: "safe",
    inputs: [
      {
        name: "connectionType",
        label: "Connection Type",
        type: "select",
        options: ["all", "listening", "established"],
        defaultValue: "all",
        helpText: "Type of connections to show",
      },
      {
        name: "protocol",
        label: "Protocol",
        type: "select",
        options: ["all", "tcp", "udp"],
        defaultValue: "all",
        helpText: "Network protocol to filter by",
      },
    ],
    commandTemplate:
      "netstat -{connectionType|all:tuln|listening:tln|established:tn}{protocol|all:|tcp:t|udp:u} | grep -v '^Active'",
    examples: [
      "netstat -tuln | grep -v '^Active'",
      "netstat -tln | grep -v '^Active'",
      "netstat -tn | grep -v '^Active'",
    ],
    notes: ["Shows network connections with process information", "Useful for checking SAP HANA ports"],
  },
  {
    id: "hana-processes",
    name: "HANA Process Check",
    description: "Show all HANA database processes",
    category: "hana",
    dangerLevel: "safe",
    inputs: [],
    commandTemplate: "ps -ef | grep hdb | grep -v grep",
    examples: ["ps -ef | grep hdb | grep -v grep"],
    notes: ["Shows all running HANA processes", "Excludes the grep process itself"],
  },
  {
    id: "hana-trace",
    name: "HANA Trace Files",
    description: "Monitor HANA trace files in real-time",
    category: "hana",
    dangerLevel: "caution",
    inputs: [
      {
        name: "sid",
        label: "System ID (SID)",
        placeholder: "HDB",
        required: true,
        helpText: "Three-character SAP system identifier",
        validator: (value) => {
          if (!value.trim()) return { isValid: false, message: "SID is required" }
          if (!/^[A-Z]{3}$/.test(value.toUpperCase())) {
            return { isValid: false, message: "SID must be exactly 3 uppercase letters" }
          }
          return { isValid: true }
        },
      },
      {
        name: "instanceNumber",
        label: "Instance Number",
        placeholder: "00",
        defaultValue: "00",
        helpText: "Two-digit HANA instance number",
        validator: (value) => {
          if (!/^\d{2}$/.test(value)) {
            return { isValid: false, message: "Instance number must be exactly 2 digits" }
          }
          return { isValid: true }
        },
      },
    ],
    commandTemplate: "tail -f /usr/sap/{sid}/HDB{instanceNumber}/*/trace/*.trc",
    examples: ["tail -f /usr/sap/HDB/HDB00/*/trace/*.trc", "tail -f /usr/sap/PRD/HDB00/*/trace/*.trc"],
    notes: ["Use Ctrl+C to stop monitoring", "May require appropriate permissions"],
  },
  {
    id: "performance-analysis",
    name: "Performance Analysis",
    description: "Analyze system performance with CPU, memory, and I/O metrics",
    category: "performance",
    dangerLevel: "safe",
    inputs: [
      {
        name: "duration",
        label: "Analysis Duration (seconds)",
        placeholder: "30",
        defaultValue: "30",
        helpText: "How long to collect performance data",
        validator: (value) => CommandValidator.validateNumber(value, 10, 300),
      },
    ],
    commandTemplate:
      "echo '=== CPU Usage ===' && top -bn1 | head -10 && echo '\\n=== Memory Usage ===' && free -h && echo '\\n=== I/O Statistics ===' && iostat -x 1 3 && echo '\\n=== Top Processes by CPU ===' && ps aux --sort=-%cpu | head -10",
    examples: [
      "echo '=== CPU Usage ===' && top -bn1 | head -10 && echo '\\n=== Memory Usage ===' && free -h && echo '\\n=== I/O Statistics ===' && iostat -x 1 3 && echo '\\n=== Top Processes by CPU ===' && ps aux --sort=-%cpu | head -10",
    ],
    notes: ["Provides comprehensive performance overview", "Includes CPU, memory, and I/O analysis"],
  },
  {
    id: "hana-backup-status",
    name: "HANA Backup Status",
    description: "Check SAP HANA backup status and history",
    category: "hana",
    dangerLevel: "safe",
    inputs: [
      {
        name: "sid",
        label: "System ID (SID)",
        placeholder: "HDB",
        required: true,
        helpText: "Three-character SAP system identifier",
        validator: (value) => {
          if (!value.trim()) return { isValid: false, message: "SID is required" }
          if (!/^[A-Z]{3}$/.test(value.toUpperCase())) {
            return { isValid: false, message: "SID must be exactly 3 uppercase letters" }
          }
          return { isValid: true }
        },
      },
      {
        name: "instanceNumber",
        label: "Instance Number",
        placeholder: "00",
        defaultValue: "00",
        helpText: "Two-digit HANA instance number",
        validator: (value) => {
          if (!/^\d{2}$/.test(value)) {
            return { isValid: false, message: "Instance number must be exactly 2 digits" }
          }
          return { isValid: true }
        },
      },
    ],
    commandTemplate:
      "find /usr/sap/{sid}/HDB{instanceNumber}/backup -name '*.bak' -o -name '*.log' | head -20 && echo '\\n=== Recent Backup Files ===' && ls -lht /usr/sap/{sid}/HDB{instanceNumber}/backup/ | head -10",
    examples: [
      "find /usr/sap/HDB/HDB00/backup -name '*.bak' -o -name '*.log' | head -20 && echo '\\n=== Recent Backup Files ===' && ls -lht /usr/sap/HDB/HDB00/backup/ | head -10",
    ],
    notes: ["Shows backup files and recent backup activity", "Helps verify backup operations"],
  },
  {
    id: "automated-health-check",
    name: "Automated Health Check",
    description: "Comprehensive system health check script",
    category: "automation",
    dangerLevel: "safe",
    inputs: [
      {
        name: "checkLevel",
        label: "Check Level",
        type: "select",
        options: ["basic", "detailed", "comprehensive"],
        defaultValue: "basic",
        helpText: "Level of health check to perform",
      },
    ],
    commandTemplate:
      "echo '=== System Health Check ({checkLevel}) ===' && echo 'Uptime:' && uptime && echo '\\nDisk Usage:' && df -h | grep -E '(Filesystem|/dev/)' && echo '\\nMemory:' && free -h && echo '\\nLoad Average:' && cat /proc/loadavg{checkLevel|detailed: && echo '\\nNetwork:' && ss -tuln | head -10|comprehensive: && echo '\\nNetwork:' && ss -tuln | head -10 && echo '\\nServices:' && systemctl list-units --failed}",
    examples: [
      "echo '=== System Health Check (basic) ===' && echo 'Uptime:' && uptime && echo '\\nDisk Usage:' && df -h | grep -E '(Filesystem|/dev/)' && echo '\\nMemory:' && free -h && echo '\\nLoad Average:' && cat /proc/loadavg",
      "echo '=== System Health Check (detailed) ===' && echo 'Uptime:' && uptime && echo '\\nDisk Usage:' && df -h | grep -E '(Filesystem|/dev/)' && echo '\\nMemory:' && free -h && echo '\\nLoad Average:' && cat /proc/loadavg && echo '\\nNetwork:' && ss -tuln | head -10",
    ],
    notes: ["Automated system health assessment", "Different levels provide varying detail"],
  },
  {
    id: "log-analyzer",
    name: "Advanced Log Analyzer",
    description: "Analyze log patterns and extract insights",
    category: "logs",
    dangerLevel: "safe",
    inputs: [
      {
        name: "logFile",
        label: "Log File Path",
        placeholder: "/var/log/messages",
        required: true,
        helpText: "Path to the log file to analyze",
        validator: CommandValidator.validatePath,
      },
      {
        name: "analysisType",
        label: "Analysis Type",
        type: "select",
        options: ["errors", "warnings", "frequency", "timeline"],
        defaultValue: "errors",
        helpText: "Type of analysis to perform",
      },
      {
        name: "timeRange",
        label: "Time Range (hours)",
        placeholder: "24",
        defaultValue: "24",
        helpText: "Analyze logs from the last N hours",
        validator: (value) => CommandValidator.validateNumber(value, 1, 168),
      },
    ],
    commandTemplate:
      "echo '=== Log Analysis: {analysisType} (last {timeRange}h) ===' && {analysisType|errors:grep -i error {logFile} | tail -20|warnings:grep -i 'warn\\|warning' {logFile} | tail -20|frequency:cut -d' ' -f1-3 {logFile} | sort | uniq -c | sort -nr | head -20|timeline:awk '{print $1\" \"$2\" \"$3}' {logFile} | sort | uniq -c | tail -20}",
    examples: [
      "echo '=== Log Analysis: errors (last 24h) ===' && grep -i error /var/log/messages | tail -20",
      "echo '=== Log Analysis: frequency (last 24h) ===' && cut -d' ' -f1-3 /var/log/messages | sort | uniq -c | sort -nr | head -20",
    ],
    notes: ["Provides different types of log analysis", "Helps identify patterns and issues"],
  },
  {
    id: "container-monitor",
    name: "Container Monitor",
    description: "Monitor Docker containers and resources",
    category: "containers",
    dangerLevel: "safe",
    inputs: [
      {
        name: "containerFilter",
        label: "Container Filter",
        placeholder: "hana",
        helpText: "Filter containers by name (optional)",
      },
    ],
    commandTemplate:
      "echo '=== Container Status ===' && docker ps -a{containerFilter| | grep {containerFilter}} && echo '\\n=== Container Resource Usage ===' && docker stats --no-stream{containerFilter| | grep {containerFilter}}",
    examples: [
      "echo '=== Container Status ===' && docker ps -a && echo '\\n=== Container Resource Usage ===' && docker stats --no-stream",
      "echo '=== Container Status ===' && docker ps -a | grep hana && echo '\\n=== Container Resource Usage ===' && docker stats --no-stream | grep hana",
    ],
    notes: ["Shows container status and resource usage", "Useful for containerized SAP HANA"],
  },
  {
    id: "database-maintenance",
    name: "Database Maintenance Check",
    description: "Check database maintenance tasks and statistics",
    category: "database",
    dangerLevel: "safe",
    inputs: [
      {
        name: "dbType",
        label: "Database Type",
        type: "select",
        options: ["hana", "postgresql", "mysql"],
        defaultValue: "hana",
        helpText: "Type of database to check",
      },
      {
        name: "checkType",
        label: "Check Type",
        type: "select",
        options: ["connections", "locks", "statistics", "size"],
        defaultValue: "connections",
        helpText: "Type of database check to perform",
      },
    ],
    commandTemplate:
      "echo '=== Database Maintenance Check: {dbType} - {checkType} ===' && {dbType|hana:echo 'HANA-specific checks would require SQL access'|postgresql:echo 'PostgreSQL checks:' && ps aux | grep postgres|mysql:echo 'MySQL checks:' && ps aux | grep mysql} && echo '\\nGeneral process check:' && ps aux | grep {dbType}",
    examples: [
      "echo '=== Database Maintenance Check: hana - connections ===' && echo 'HANA-specific checks would require SQL access' && echo '\\nGeneral process check:' && ps aux | grep hana",
    ],
    notes: ["Database-specific maintenance checks", "Some checks may require database access"],
  },
  {
    id: "table-statistics",
    name: "Table Statistics",
    description: "Analyze table statistics and data distribution",
    category: "queries",
    dangerLevel: "safe",
    inputs: [
      {
        name: "schema",
        label: "Schema Name",
        placeholder: "TEST_LIVE",
        required: true,
        helpText: "Schema to analyze",
        validator: (value) => {
          if (!value.trim()) return { isValid: false, message: "Schema name is required" }
          return { isValid: true }
        },
      },
      {
        name: "tableName",
        label: "Table Name (optional)",
        placeholder: "CUSTOMERS",
        helpText: "Specific table to analyze (leave empty for all tables)",
      },
      {
        name: "statisticsType",
        label: "Statistics Type",
        type: "select",
        options: ["table_sizes", "row_counts", "column_stats", "index_usage"],
        defaultValue: "table_sizes",
        helpText: "Type of statistics to generate",
      },
    ],
    commandTemplate:
      "SELECT {statisticsType|table_sizes:TABLE_NAME, RECORD_COUNT, TABLE_SIZE, DISK_SIZE FROM M_TABLES|row_counts:TABLE_NAME, RECORD_COUNT, LAST_COMPRESSED_RECORD_COUNT FROM M_TABLES|column_stats:TABLE_NAME, COLUMN_NAME, DISTINCT_COUNT, NULL_COUNT FROM M_CS_COLUMNS|index_usage:INDEX_NAME, TABLE_NAME, LAST_ACCESS_TIME FROM M_INDEXES} WHERE SCHEMA_NAME = '{schema}'{tableName| AND TABLE_NAME = '{tableName}'} ORDER BY {statisticsType|table_sizes:TABLE_SIZE DESC|row_counts:RECORD_COUNT DESC|column_stats:DISTINCT_COUNT DESC|index_usage:LAST_ACCESS_TIME DESC} LIMIT 50;",
    examples: [
      "SELECT TABLE_NAME, RECORD_COUNT, TABLE_SIZE, DISK_SIZE FROM M_TABLES WHERE SCHEMA_NAME = 'TEST_LIVE' ORDER BY TABLE_SIZE DESC LIMIT 50;",
      "SELECT TABLE_NAME, COLUMN_NAME, DISTINCT_COUNT, NULL_COUNT FROM M_CS_COLUMNS WHERE SCHEMA_NAME = 'TEST_LIVE' AND TABLE_NAME = 'CUSTOMERS' ORDER BY DISTINCT_COUNT DESC LIMIT 50;",
    ],
    notes: [
      "Helps optimize database performance",
      "Use for capacity planning and maintenance",
      "Column statistics useful for query optimization",
    ],
  },
  {
    id: "connection-monitor",
    name: "Connection Monitor",
    description: "Monitor active database connections and sessions",
    category: "queries",
    dangerLevel: "safe",
    inputs: [
      {
        name: "connectionType",
        label: "Connection Type",
        type: "select",
        options: ["active_sessions", "blocked_sessions", "user_connections", "connection_stats"],
        defaultValue: "active_sessions",
        helpText: "Type of connection information to display",
      },
      {
        name: "timeFilter",
        label: "Time Filter (minutes)",
        placeholder: "30",
        defaultValue: "30",
        helpText: "Show connections from last N minutes",
        validator: (value) => CommandValidator.validateNumber(value, 1, 1440),
      },
    ],
    commandTemplate:
      "SELECT {connectionType|active_sessions:CONNECTION_ID, USER_NAME, CLIENT_IP, START_TIME, STATEMENT_STRING FROM M_CONNECTIONS|blocked_sessions:CONNECTION_ID, USER_NAME, LOCK_WAIT_NAME, LOCK_WAIT_TIME FROM M_BLOCKED_TRANSACTIONS|user_connections:USER_NAME, COUNT(*) as CONNECTION_COUNT FROM M_CONNECTIONS GROUP BY USER_NAME|connection_stats:CLIENT_IP, COUNT(*) as CONNECTIONS, MAX(START_TIME) as LAST_CONNECTION FROM M_CONNECTIONS GROUP BY CLIENT_IP} {connectionType|active_sessions:WHERE START_TIME > ADD_SECONDS(CURRENT_TIMESTAMP, -{timeFilter}*60)|blocked_sessions:WHERE LOCK_WAIT_TIME > 0|user_connections:|connection_stats:} ORDER BY {connectionType|active_sessions:START_TIME DESC|blocked_sessions:LOCK_WAIT_TIME DESC|user_connections:CONNECTION_COUNT DESC|connection_stats:CONNECTIONS DESC} LIMIT 20;",
    examples: [
      "SELECT CONNECTION_ID, USER_NAME, CLIENT_IP, START_TIME, STATEMENT_STRING FROM M_CONNECTIONS WHERE START_TIME > ADD_SECONDS(CURRENT_TIMESTAMP, -1800) ORDER BY START_TIME DESC LIMIT 20;",
      "SELECT USER_NAME, COUNT(*) as CONNECTION_COUNT FROM M_CONNECTIONS GROUP BY USER_NAME ORDER BY CONNECTION_COUNT DESC LIMIT 20;",
    ],
    notes: [
      "Monitor database connection health",
      "Identify blocked or long-running sessions",
      "Useful for troubleshooting performance issues",
    ],
  },
  {
    id: "system-replication",
    name: "System Replication Status",
    description: "Check HANA system replication status and lag",
    category: "queries",
    dangerLevel: "safe",
    inputs: [
      {
        name: "checkType",
        label: "Check Type",
        type: "select",
        options: ["replication_status", "replication_lag", "site_info", "service_status"],
        defaultValue: "replication_status",
        helpText: "Type of replication information to check",
      },
    ],
    commandTemplate:
      "SELECT {checkType|replication_status:SITE_NAME, REPLICATION_STATUS, REPLICATION_STATUS_DETAILS FROM M_SERVICE_REPLICATION|replication_lag:SITE_NAME, SHIPPED_LOG_POSITION, REPLAYED_LOG_POSITION, SHIPPING_DELAY FROM M_SERVICE_REPLICATION|site_info:SITE_ID, SITE_NAME, IS_PRIMARY, IS_CURRENT FROM M_LANDSCAPE_HOST_CONFIGURATION|service_status:HOST, PORT, SERVICE_NAME, ACTIVE_STATUS FROM M_SERVICES WHERE SERVICE_NAME LIKE '%replication%'} ORDER BY {checkType|replication_status:SITE_NAME|replication_lag:SHIPPING_DELAY DESC|site_info:SITE_ID|service_status:HOST, PORT};",
    examples: [
      "SELECT SITE_NAME, REPLICATION_STATUS, REPLICATION_STATUS_DETAILS FROM M_SERVICE_REPLICATION ORDER BY SITE_NAME;",
      "SELECT SITE_NAME, SHIPPED_LOG_POSITION, REPLAYED_LOG_POSITION, SHIPPING_DELAY FROM M_SERVICE_REPLICATION ORDER BY SHIPPING_DELAY DESC;",
    ],
    notes: [
      "Monitor HANA system replication health",
      "Check for replication delays or issues",
      "Essential for disaster recovery monitoring",
    ],
  },
  {
    id: "tenant-management",
    name: "Tenant Database Management",
    description: "Manage tenant databases in multi-tenant systems",
    category: "queries",
    dangerLevel: "high",
    inputs: [
      {
        name: "operation",
        label: "Operation",
        type: "select",
        options: ["LIST_TENANTS", "CREATE_TENANT", "DROP_TENANT", "START_TENANT", "STOP_TENANT"],
        defaultValue: "LIST_TENANTS",
        helpText: "Tenant management operation",
      },
      {
        name: "tenantName",
        label: "Tenant Name",
        placeholder: "TENANT_DB",
        helpText: "Name of tenant database (for create/drop/start/stop operations)",
      },
      {
        name: "adminUser",
        label: "Admin User",
        placeholder: "SYSTEM",
        helpText: "Admin user for new tenant (CREATE_TENANT only)",
      },
      {
        name: "adminPassword",
        label: "Admin Password",
        placeholder: "AdminPassword123",
        helpText: "Admin password for new tenant (CREATE_TENANT only)",
      },
    ],
    commandTemplate:
      "{operation|LIST_TENANTS:SELECT DATABASE_NAME, ACTIVE_STATUS, RESTART_MODE, CREATE_TIME FROM SYS.M_DATABASES ORDER BY CREATE_TIME DESC;|CREATE_TENANT:CREATE DATABASE {tenantName} SYSTEM USER PASSWORD '{adminPassword}';|DROP_TENANT:DROP DATABASE {tenantName} CASCADE;|START_TENANT:ALTER SYSTEM START DATABASE {tenantName};|STOP_TENANT:ALTER SYSTEM STOP DATABASE {tenantName};}",
    examples: [
      "SELECT DATABASE_NAME, ACTIVE_STATUS, RESTART_MODE, CREATE_TIME FROM SYS.M_DATABASES ORDER BY CREATE_TIME DESC;",
      "CREATE DATABASE TENANT_DB SYSTEM USER PASSWORD 'AdminPassword123';",
      "ALTER SYSTEM START DATABASE TENANT_DB;",
    ],
    notes: [
      "HIGH RISK: Tenant operations affect entire databases",
      "Always backup before dropping tenants",
      "Verify tenant status before operations",
    ],
  },
  {
    id: "import-data",
    name: "Data Import",
    description: "Import data from CSV or other formats into HANA table",
    category: "queries",
    dangerLevel: "caution",
    inputs: [
      {
        name: "schema",
        label: "Target Schema",
        placeholder: "TEST_LIVE",
        required: true,
        helpText: "Schema where data will be imported",
        validator: (value) => {
          if (!value.trim()) return { isValid: false, message: "Schema name is required" }
          return { isValid: true }
        },
      },
      {
        name: "tableName",
        label: "Target Table",
        placeholder: "CUSTOMERS",
        required: true,
        helpText: "Table where data will be imported",
        validator: (value) => {
          if (!value.trim()) return { isValid: false, message: "Table name is required" }
          return { isValid: true }
        },
      },
      {
        name: "filePath",
        label: "Source File Path",
        placeholder: "/usr/sap/HDB/HDB00/work/imports/customers.csv",
        required: true,
        helpText: "Full path to the source data file",
        validator: CommandValidator.validatePath,
      },
      {
        name: "format",
        label: "File Format",
        type: "select",
        options: ["CSV", "BINARY"],
        defaultValue: "CSV",
        helpText: "Format of the source file",
      },
      {
        name: "errorHandling",
        label: "Error Handling",
        type: "select",
        options: ["FAIL_ON_ERROR", "SKIP_ON_ERROR"],
        defaultValue: "FAIL_ON_ERROR",
        helpText: "How to handle import errors",
      },
    ],
    commandTemplate: 'IMPORT FROM {format} FILE \'{filePath}\' INTO "{schema}"."{tableName}" WITH {errorHandling};',
    examples: [
      'IMPORT FROM CSV FILE \'/usr/sap/HDB/HDB00/work/imports/customers.csv\' INTO "TEST_LIVE"."CUSTOMERS" WITH FAIL_ON_ERROR;',
      'IMPORT FROM BINARY FILE \'/usr/sap/HDB/HDB00/work/imports/orders.dat\' INTO "TEST_LIVE"."ORDERS" WITH SKIP_ON_ERROR;',
    ],
    notes: [
      "Ensure file format matches table structure",
      "Use SKIP_ON_ERROR for partial imports",
      "Verify file permissions and accessibility",
    ],
  },
]

export const getCategoryIcon = (category: string) => {
  switch (category) {
    case "filesystem":
      return <HardDrive className="h-5 w-5" />
    case "system":
      return <Monitor className="h-5 w-5" />
    case "logs":
      return <FileText className="h-5 w-5" />
    case "network":
      return <Network className="h-5 w-5" />
    case "hana":
      return <Database className="h-5 w-5" />
    case "security":
      return <Shield className="h-5 w-5" />
    case "performance":
      return <Monitor className="h-5 w-5" />
    case "automation":
      return <Settings className="h-5 w-5" />
    case "containers":
      return <HardDrive className="h-5 w-5" />
    case "database":
      return <Database className="h-5 w-5" />
    case "monitoring":
      return <Monitor className="h-5 w-5" />
    case "queries":
      return <Search className="h-5 w-5" />
    default:
      return <Settings className="h-5 w-5" />
  }
}
