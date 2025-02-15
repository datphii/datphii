'use client'

import { useState } from 'react'
import Link from 'next/link'

type SearchResult = {
  "Product Name": string
  "Brand": string
  "Price": string | number
  "Stock": number
  "Description": string
  message?: string
} 

// Thêm type riêng cho error response
type ErrorResponse = {
  error: string
}

// Thêm các type mới
type Category = {
  name: string
  brands: string[]
}

type PriceRange = {
  id: string
  name: string
  min: number
  max: number | null
}

// Thêm các hằng số
const categories: Category[] = [
  {
    name: "Nước hoa Nam",
    brands: ["DAVIDOFF", "Lacoste", "Versace", "BURBERRY", "NAUTICA"]
  },
  {
    name: "Nước hoa Nữ", 
    brands: ["Marc Jacobs Fragrances", "Juliette Has a Gun", "Carolina Herrera"]
  },
  {
    name: "Nước hoa Unisex",
    brands: ["LE LABO", "TOM FORD", "Dolce&Gabbana"]
  }
]

const priceRanges: PriceRange[] = [
  { id: 'all', name: 'Tất cả mức giá', min: 0, max: null },
  { id: 'under-500', name: 'Dưới 500.000đ', min: 0, max: 500000 },
  { id: '500-2000', name: '500.000đ - 2.000.000đ', min: 500000, max: 2000000 },
  { id: 'over-2000', name: 'Trên 2.000.000đ', min: 2000000, max: null }
]

// Thêm component Toast
const Toast = ({ message, onClose }: { message: string; onClose: () => void }) => {
  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-md shadow-lg flex items-center gap-2">
      <span>{message}</span>
      <button onClick={onClose} className="text-gray-300 hover:text-white">
        ✕
      </button>
    </div>
  )
}

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('')
  // Sửa kiểu dữ liệu của state result
  const [result, setResult] = useState<SearchResult | ErrorResponse | null>(null)
  const [loading, setLoading] = useState(false)

  // Thêm states mới
  const [selectedCategory, setSelectedCategory] = useState('')
  const [brandFilter, setBrandFilter] = useState('')
  const [priceFilter, setPriceFilter] = useState('all')

  // Thêm state cho toast
  const [toast, setToast] = useState<string | null>(null)

  // Cập nhật hàm searchProduct
  const searchProduct = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (searchTerm) params.append('name', searchTerm)
      if (selectedCategory) params.append('category', selectedCategory)
      if (brandFilter) params.append('brand', brandFilter)
      if (priceFilter !== 'all') {
        const range = priceRanges.find(r => r.id === priceFilter)
        if (range) {
          params.append('minPrice', range.min.toString())
          if (range.max) params.append('maxPrice', range.max.toString())
        }
      }

      const response = await fetch(`/api/products?${params.toString()}`)
      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error('Lỗi:', error)
      setResult({ error: 'Đã xảy ra lỗi khi tìm kiếm sản phẩm' })
    } finally {
      setLoading(false)
    }
  }

  // Lấy danh sách thương hiệu dựa trên category
  const availableBrands = selectedCategory
    ? categories.find(c => c.name === selectedCategory)?.brands || []
    : []

  // Thêm hàm copy
  const copyProductData = (product: SearchResult) => {
    const productData = JSON.stringify(product, null, 2)
    navigator.clipboard.writeText(productData)
    setToast('Đã sao chép thông tin sản phẩm!')
    setTimeout(() => setToast(null), 3000)
  }

  // Thêm hàm copy tất cả sản phẩm
  const copyAllProducts = () => {
    if (!result || 'error' in result) return;
    
    const productsData = Array.isArray(result) ? result : [result];
    const formattedData = productsData.map(product => ({
      name: product["Product Name"],
      brand: product["Brand"],
      price: product["Price"],
      stock: product["Stock"],
      description: product["Description"]
    }));
    
    navigator.clipboard.writeText(JSON.stringify(formattedData, null, 2))
    setToast('Đã sao chép tất cả sản phẩm!')
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Tìm Kiếm Nước Hoa</h1>
          <Link 
            href="/products" 
            className="text-blue-500 hover:text-blue-600"
          >
            Xem tất cả sản phẩm
          </Link>
        </div>
        
        <div className="space-y-4 mb-6">
          <div className="flex gap-2">
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

          {/* Thêm bộ lọc */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value)
                setBrandFilter('')
              }}
              className="p-2 border rounded-md"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map(category => (
                <option key={category.name} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>

            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="p-2 border rounded-md"
              disabled={!selectedCategory}
            >
              <option value="">Tất cả thương hiệu</option>
              {availableBrands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>

            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="p-2 border rounded-md"
            >
              {priceRanges.map(range => (
                <option key={range.id} value={range.id}>
                  {range.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {result && (
          <div className="bg-white shadow rounded-lg p-6">
            {'error' in result ? (
              <p className="text-red-500">{result.error}</p>
            ) : Array.isArray(result) ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="font-medium">Tìm thấy {result.length} sản phẩm:</p>
                  <button
                    onClick={copyAllProducts}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
                  >
                    📋 Copy tất cả
                  </button>
                </div>
                {result.map((product, index) => (
                  <div key={index} className="border-b pb-4 last:border-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-800">{product["Product Name"]}</h2>
                        <p className="text-gray-600">Thương hiệu: {product["Brand"]}</p>
                        <p className="text-gray-600">Giá bán: {product["Price"]}</p>
                        <p className="text-gray-600">Tồn kho: {product["Stock"]}</p>
                        <p className="text-gray-600 mt-2 text-sm italic">{product["Description"]}</p>
                      </div>
                      <button
                        onClick={() => copyProductData(product)}
                        className="text-blue-500 hover:text-blue-600 px-3 py-1 rounded-md hover:bg-blue-50"
                        title="Sao chép thông tin"
                      >
                        📋 Copy
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">{result["Product Name"]}</h2>
                    <p className="text-gray-600">Thương hiệu: {result["Brand"]}</p>
                    <p className="text-gray-600">Giá bán: {result["Price"]}</p>
                    <p className="text-gray-600">Tồn kho: {result["Stock"]}</p>
                    <p className="text-gray-600 mt-2 text-sm italic">{result["Description"]}</p>
                    {result.message && (
                      <p className="text-yellow-600 mt-2">{result.message}</p>
                    )}
                  </div>
                  <button
                    onClick={() => copyProductData(result)}
                    className="text-blue-500 hover:text-blue-600 px-3 py-1 rounded-md hover:bg-blue-50"
                    title="Sao chép thông tin"
                  >
                    📋 Copy
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Thêm Toast notification */}
        {toast && (
          <Toast 
            message={toast} 
            onClose={() => setToast(null)} 
          />
        )}
      </div>
    </div>
  )
} 