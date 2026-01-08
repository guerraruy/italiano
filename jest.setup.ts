import '@testing-library/jest-dom'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
}
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

// Mock Response class with all necessary methods
class MockResponse {
  public ok = true
  public status = 200
  public statusText = 'OK'
  public headers = new (global.Headers as any)()
  public body: any
  public init: any

  constructor(body?: any, init?: any) {
    this.body = body
    this.init = init
  }

  clone() {
    return new MockResponse(this.body, this.init)
  }

  async json() {
    return {}
  }

  async text() {
    return ''
  }

  async blob() {
    return new Blob()
  }

  async arrayBuffer() {
    return new ArrayBuffer(0)
  }
}

// Mock fetch - prevents RTK Query from making real network requests
global.fetch = jest.fn(() =>
  Promise.resolve(new MockResponse())
)

// Mock Request for fetchBaseQuery
global.Request = class MockRequest {
  constructor(public input: any, public init?: any) {}
} as any

// Mock Response
global.Response = MockResponse as any

// Mock Headers
global.Headers = class MockHeaders {
  private headers = new Map()
  constructor(init?: any) {}
  append(name: string, value: string) {
    this.headers.set(name, value)
  }
  delete(name: string) {
    this.headers.delete(name)
  }
  get(name: string) {
    return this.headers.get(name) || null
  }
  has(name: string) {
    return this.headers.has(name)
  }
  set(name: string, value: string) {
    this.headers.set(name, value)
  }
  forEach(callback: any) {
    this.headers.forEach((value, key) => callback(value, key))
  }
} as any
