"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Code } from "lucide-react"
import type { DataTable } from "@/components/data-table-management"

interface DataFieldsTabProps {
  table: DataTable
}

export function DataFieldsTab({ table }: DataFieldsTabProps) {
  // 模拟数据库中的真实数据
  const sampleData = [
    {
      user_id: "user_12345",
      action_type: "page_view",
      timestamp: "2024-01-15T14:30:25Z",
      session_id: "sess_abcdef123456",
      page_url: "/dashboard",
      device_type: "desktop",
      location: "Beijing, China",
      metadata: '{"browser": "Chrome", "version": "120.0.0.0"}',
    },
    {
      user_id: "user_67890",
      action_type: "button_click",
      timestamp: "2024-01-15T14:28:15Z",
      session_id: "sess_ghijkl789012",
      page_url: "/profile",
      device_type: "mobile",
      location: "Shanghai, China",
      metadata: '{"browser": "Safari", "version": "17.1.0"}',
    },
    {
      user_id: "user_11111",
      action_type: "form_submit",
      timestamp: "2024-01-15T14:25:45Z",
      session_id: "sess_mnopqr345678",
      page_url: "/contact",
      device_type: "desktop",
      location: "Guangzhou, China",
      metadata: '{"browser": "Firefox", "version": "121.0.0"}',
    },
    {
      user_id: "user_22222",
      action_type: "page_view",
      timestamp: "2024-01-15T14:22:30Z",
      session_id: "sess_stuvwx901234",
      page_url: "/products",
      device_type: "tablet",
      location: "Shenzhen, China",
      metadata: '{"browser": "Edge", "version": "120.0.0.0"}',
    },
    {
      user_id: "user_33333",
      action_type: "search",
      timestamp: "2024-01-15T14:20:10Z",
      session_id: "sess_yzabcd567890",
      page_url: "/search",
      device_type: "mobile",
      location: "Hangzhou, China",
      metadata: '{"browser": "Chrome", "version": "120.0.0.0"}',
    },
    {
      user_id: "user_44444",
      action_type: "download",
      timestamp: "2024-01-15T14:18:55Z",
      session_id: "sess_efghij123456",
      page_url: "/downloads",
      device_type: "desktop",
      location: "Nanjing, China",
      metadata: '{"browser": "Chrome", "version": "119.0.0.0"}',
    },
    {
      user_id: "user_55555",
      action_type: "logout",
      timestamp: "2024-01-15T14:15:20Z",
      session_id: "sess_klmnop789012",
      page_url: "/logout",
      device_type: "mobile",
      location: "Wuhan, China",
      metadata: '{"browser": "Safari", "version": "17.0.0"}',
    },
    {
      user_id: "user_66666",
      action_type: "login",
      timestamp: "2024-01-15T14:12:40Z",
      session_id: "sess_qrstuv345678",
      page_url: "/login",
      device_type: "desktop",
      location: "Chengdu, China",
      metadata: '{"browser": "Firefox", "version": "120.0.0"}',
    },
    {
      user_id: "user_77777",
      action_type: "page_view",
      timestamp: "2024-01-15T14:10:15Z",
      session_id: "sess_wxyzab901234",
      page_url: "/about",
      device_type: "tablet",
      location: "Xi'an, China",
      metadata: '{"browser": "Safari", "version": "16.6.0"}',
    },
    {
      user_id: "user_88888",
      action_type: "share",
      timestamp: "2024-01-15T14:08:30Z",
      session_id: "sess_cdefgh567890",
      page_url: "/article/123",
      device_type: "mobile",
      location: "Tianjin, China",
      metadata: '{"browser": "Chrome", "version": "120.0.0.0"}',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 字段定义 */}
        <Card className="tech-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <FileText className="w-5 h-5 mr-3 text-blue-400" />
              字段定义
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {table.fields.map((field) => (
                <div
                  key={field.name}
                  className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50"
                >
                  <div className="flex items-center space-x-3">
                    <span className="code-font text-blue-400 font-medium">{field.name}</span>
                    {field.required && (
                      <Badge variant="outline" className="text-xs bg-red-500/10 text-red-400 border-red-500/30">
                        必填
                      </Badge>
                    )}
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      field.type === "string"
                        ? "bg-green-500/10 text-green-400 border-green-500/30"
                        : field.type === "number"
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                          : field.type === "datetime"
                            ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                            : "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                    }`}
                  >
                    {field.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 数据示例 - 表格形式 */}
        <Card className="tech-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Code className="w-5 h-5 mr-3 text-green-400" />
              数据示例 (最近10条)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="tech-card rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-800/50 border-b border-slate-700/50">
                    <tr>
                      {table.fields.slice(0, 4).map((field) => (
                        <th key={field.name} className="text-left p-2 text-xs font-medium text-slate-300 code-font">
                          {field.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sampleData.map((row, index) => (
                      <tr key={index} className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors">
                        <td className="p-2 text-xs code-font text-blue-400">{row.user_id}</td>
                        <td className="p-2 text-xs code-font text-green-400">{row.action_type}</td>
                        <td className="p-2 text-xs code-font text-purple-400">{row.timestamp}</td>
                        <td className="p-2 text-xs code-font text-slate-300">{row.session_id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="mt-4 p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
              <div className="text-xs text-slate-400">
                显示最近 10 条数据记录，仅展示前 4 个字段。完整数据包含 {table.fieldCount} 个字段。
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
