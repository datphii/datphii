'use client'

import { useState } from 'react'

type SearchResult = {
  "Tên hàng": string
  "Thương hiệu": string
  "Giá bán": string | number
  "Tồn kho": number
  message?: string
  error?: string
}

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('')
  const [result, setResult] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)

  const searchProduct = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/products?name=${encodeURIComponent(searchTerm)}`)
      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error('Lỗi:', error)
      setResult({ error: 'Đã xảy ra lỗi khi tìm kiếm sản phẩm' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Tìm Kiếm Nước Hoa</h1>
        
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Nhập tên nước hoa..."
            className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={searchProduct}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Đang tìm...' : 'Tìm'}
          </button>
        </div>

        {result && (
          <div className="bg-white shadow rounded-lg p-6">
            {result.error ? (
              <p className="text-red-500">{result.error}</p>
            ) : (
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-gray-800">{result["Tên hàng"]}</h2>
                <p className="text-gray-600">Thương hiệu: {result["Thương hiệu"]}</p>
                <p className="text-gray-600">Giá bán: {result["Giá bán"]}</p>
                <p className="text-gray-600">Tồn kho: {result["Tồn kho"]}</p>
                {result.message && (
                  <p className="text-yellow-600 mt-2">{result.message}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 