'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type Product = {
  "Tên hàng": string
  "Thương hiệu": string
  "Giá bán": string | number
  "Tồn kho": number
}

type Category = {
  name: string
  brands: string[]
}

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

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [brandFilter, setBrandFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const productsPerPage = 12

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products')
        const data = await response.json()
        setProducts(data)
      } catch (error) {
        console.error('Lỗi:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Lấy danh sách thương hiệu dựa trên category
  const availableBrands = selectedCategory
    ? categories.find(c => c.name === selectedCategory)?.brands || []
    : [...new Set(products.map(p => p["Thương hiệu"]))].sort()

  // Lọc sản phẩm theo category và brand
  const filteredProducts = products.filter(product => {
    if (selectedCategory) {
      const categoryBrands = categories.find(c => c.name === selectedCategory)?.brands || []
      if (!categoryBrands.includes(product["Thương hiệu"])) return false
    }
    if (brandFilter) {
      return product["Thương hiệu"] === brandFilter
    }
    return true
  })

  // Tính toán phân trang
  const indexOfLastProduct = currentPage * productsPerPage
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct)
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)

  // Format giá tiền
  const formatPrice = (price: string | number) => {
    if (typeof price === 'string') {
      return price.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
    }
    return price.toLocaleString('vi-VN')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Đang tải...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header và Filters */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Danh Sách Nước Hoa</h1>
            <Link href="/" className="text-blue-500 hover:text-blue-600">
              Quay lại trang chủ
            </Link>
          </div>
          
          <div className="flex flex-wrap gap-4">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value)
                setBrandFilter('')
                setCurrentPage(1)
              }}
              className="p-2 border rounded-md min-w-[200px]"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map(category => (
                <option key={category.name} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* Brand Filter */}
            <select
              value={brandFilter}
              onChange={(e) => {
                setBrandFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="p-2 border rounded-md min-w-[200px]"
            >
              <option value="">Tất cả thương hiệu</option>
              {availableBrands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>

            {/* Products count */}
            <span className="ml-auto text-gray-600">
              Hiển thị {filteredProducts.length} sản phẩm
            </span>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentProducts.map((product, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{product["Tên hàng"]}</h2>
              <p className="text-gray-600">Thương hiệu: {product["Thương hiệu"]}</p>
              <p className="text-gray-600">Giá bán: {formatPrice(product["Giá bán"])} VNĐ</p>
              <p className="text-gray-600">Tồn kho: {product["Tồn kho"]}</p>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-8 flex justify-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded-md disabled:opacity-50"
          >
            Trước
          </button>
          <span className="px-4 py-2">
            Trang {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded-md disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      </div>
    </div>
  )
} 