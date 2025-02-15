import { NextResponse } from 'next/server'
import products from '@/data/danh_sach_san_pham.json'

type Product = {
  "Product Name": string
  "Brand": string 
  "Price": string | number
  "Stock": number
  "Description": string
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

// Thêm /* eslint-disable */ để tắt cảnh báo ESLint
/* eslint-disable @typescript-eslint/no-unused-vars */
export async function OPTIONS(_request: Request) {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': 'https://your-domain.vercel.app',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
/* eslint-enable @typescript-eslint/no-unused-vars */

export async function GET(request: Request) {
  // Thêm CORS header cho GET request
  const headers = {
    'Access-Control-Allow-Origin': 'https://your-domain.vercel.app',
    'Content-Type': 'application/json',
  }

  try {
    const { searchParams } = new URL(request.url)
    
    // Các tham số filter
    const name = searchParams.get('name')
    const category = searchParams.get('category')
    const brand = searchParams.get('brand')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const sortBy = searchParams.get('sortBy') // price-asc, price-desc, name-asc, name-desc
    
    // Chuyển đổi giá từ string sang number
    const parsePrice = (price: string | number): number => {
      if (typeof price === 'number') return price
      return Number(price.replace(/[^\d]/g, ''))
    }

    let filteredProducts = [...products] as Product[]

    // Lọc theo tên hoặc thương hiệu
    if (name) {
      filteredProducts = filteredProducts.filter(
        (p: Product) => 
          p["Product Name"]?.toLowerCase().includes(name.toLowerCase()) ||
          p["Brand"]?.toLowerCase().includes(name.toLowerCase())
      )
    }

    // Lọc theo category
    if (category) {
      const categoryBrands = categories.find(c => c.name === category)?.brands || []
      filteredProducts = filteredProducts.filter(
        (p: Product) => categoryBrands.includes(p["Brand"])
      )
    }

    // Lọc theo thương hiệu
    if (brand) {
      filteredProducts = filteredProducts.filter(
        (p: Product) => p["Brand"] === brand
      )
    }

    // Lọc theo khoảng giá
    if (minPrice) {
      filteredProducts = filteredProducts.filter(
        (p: Product) => parsePrice(p["Price"]) >= Number(minPrice)
      )
    }
    if (maxPrice) {
      filteredProducts = filteredProducts.filter(
        (p: Product) => parsePrice(p["Price"]) <= Number(maxPrice)
      )
    }

    // Sắp xếp sản phẩm
    if (sortBy) {
      switch (sortBy) {
        case 'price-asc':
          filteredProducts.sort((a, b) => parsePrice(a["Price"]) - parsePrice(b["Price"]))
          break
        case 'price-desc':
          filteredProducts.sort((a, b) => parsePrice(b["Price"]) - parsePrice(a["Price"]))
          break
        case 'name-asc':
          filteredProducts.sort((a, b) => a["Product Name"].localeCompare(b["Product Name"]))
          break
        case 'name-desc':
          filteredProducts.sort((a, b) => b["Product Name"].localeCompare(a["Product Name"]))
          break
      }
    }

    // Lọc bỏ sản phẩm không hợp lệ
    filteredProducts = filteredProducts.filter(
      (p: Product) => p["Product Name"] && p["Brand"] && p["Price"] && p["Stock"] != null
    )

    if (filteredProducts.length === 0) {
      return NextResponse.json(
        { error: 'Không tìm thấy sản phẩm' },
        { status: 404, headers }
      )
    }

    return NextResponse.json(filteredProducts, { headers })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi xử lý yêu cầu' },
      { status: 500, headers }
    )
  }
} 