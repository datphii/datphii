import { NextResponse } from 'next/server'
import products from '@/data/danh_sach_san_pham.json'

type Product = {
  "Tên hàng": string
  "Thương hiệu": string 
  "Giá bán": string | number
  "Tồn kho": number
}

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
    const name = searchParams.get('name')

    if (name) {
      const product = (products as Product[]).find(
        (p: Product) => p["Tên hàng"]?.toLowerCase().includes(name.toLowerCase())
      )

      if (!product) {
        return NextResponse.json(
          { error: 'Không tìm thấy sản phẩm' },
          { status: 404, headers }
        )
      }

      if (product["Tồn kho"] === 0) {
        return NextResponse.json(
          { 
            ...product,
            message: 'Sản phẩm đã hết hàng'
          },
          { status: 200, headers }
        )
      }

      return NextResponse.json(product, { headers })
    }

    // Lọc bỏ các sản phẩm có dữ liệu null/undefined
    const validProducts = (products as Product[]).filter(
      (p: Product) => p["Tên hàng"] && p["Thương hiệu"] && p["Giá bán"] && p["Tồn kho"] != null
    )

    return NextResponse.json(validProducts, { headers })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi xử lý yêu cầu' },
      { status: 500, headers }
    )
  }
} 