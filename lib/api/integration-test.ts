/**
 * Integration Testing Utilities
 * Test frontend-backend communication without mocking
 */

import { authService } from "./auth-service"
import { venueService } from "./venue-service"
import { eventService } from "./events"
import { bookingService } from "./booking-service"

interface TestResult {
  name: string
  status: "PASS" | "FAIL"
  duration: number
  error?: string
}

export const integrationTests = {
  results: [] as TestResult[],

  async runAllTests() {
    console.log("[Integration Tests] Starting full test suite...")

    // Authentication Tests
    await this.testUserSignup()
    await this.testUserLogin()
    await this.testVendorSignup()
    await this.testTokenValidation()

    // Venue Tests
    await this.testFetchVenues()
    await this.testFetchVenueDetails()

    // Event Tests
    await this.testFetchEvents()
    await this.testFetchEventDetails()

    // Booking Tests
    await this.testCreateBooking()

    console.log("[Integration Tests] Test Summary:")
    console.log(`Total: ${this.results.length}`)
    console.log(`Passed: ${this.results.filter((r) => r.status === "PASS").length}`)
    console.log(`Failed: ${this.results.filter((r) => r.status === "FAIL").length}`)

    return this.results
  },

  async testUserSignup() {
    const start = Date.now()
    const testName = "User Signup"

    try {
      const response = await authService.userSignup({
        email: `testuser-${Date.now()}@eventvenue.com`,
        password: "TestPass@123",
        name: "Test User",
      })

      if (response.token && response.userId) {
        this.results.push({
          name: testName,
          status: "PASS",
          duration: Date.now() - start,
        })
        console.log(`✓ ${testName} passed (${response.userId})`)
      } else {
        throw new Error("No token or userId in response")
      }
    } catch (error) {
      this.results.push({
        name: testName,
        status: "FAIL",
        duration: Date.now() - start,
        error: String(error),
      })
      console.error(`✗ ${testName} failed:`, error)
    }
  },

  async testUserLogin() {
    const start = Date.now()
    const testName = "User Login"

    try {
      const response = await authService.userLogin({
        email: "user1@eventvenue.com",
        password: "password123",
      })

      if (response.token && response.role === "USER") {
        this.results.push({
          name: testName,
          status: "PASS",
          duration: Date.now() - start,
        })
        console.log(`✓ ${testName} passed`)
      } else {
        throw new Error("Invalid response structure")
      }
    } catch (error) {
      this.results.push({
        name: testName,
        status: "FAIL",
        duration: Date.now() - start,
        error: String(error),
      })
      console.error(`✗ ${testName} failed:`, error)
    }
  },

  async testVendorSignup() {
    const start = Date.now()
    const testName = "Vendor Signup"

    try {
      const response = await authService.vendorSignup({
        email: `testvendor-${Date.now()}@eventvenue.com`,
        password: "VendorPass@123",
        name: "Test Vendor",
        businessName: "Test Business",
        businessDescription: "Test Description",
      })

      if (response.token && response.role === "VENDOR") {
        this.results.push({
          name: testName,
          status: "PASS",
          duration: Date.now() - start,
        })
        console.log(`✓ ${testName} passed`)
      } else {
        throw new Error("Invalid response structure")
      }
    } catch (error) {
      this.results.push({
        name: testName,
        status: "FAIL",
        duration: Date.now() - start,
        error: String(error),
      })
      console.error(`✗ ${testName} failed:`, error)
    }
  },

  async testTokenValidation() {
    const start = Date.now()
    const testName = "Token Validation"

    try {
      // Try with invalid token
      const token = "invalid.token.here"
      const response = await fetch("http://localhost:8080/api/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      // Should return 401
      if (response.status === 401) {
        this.results.push({
          name: testName,
          status: "PASS",
          duration: Date.now() - start,
        })
        console.log(`✓ ${testName} passed`)
      } else {
        throw new Error(`Expected 401, got ${response.status}`)
      }
    } catch (error) {
      this.results.push({
        name: testName,
        status: "FAIL",
        duration: Date.now() - start,
        error: String(error),
      })
      console.error(`✗ ${testName} failed:`, error)
    }
  },

  async testFetchVenues() {
    const start = Date.now()
    const testName = "Fetch Venues"

    try {
      const response = await venueService.getVenues()

      if (Array.isArray(response) && response.length > 0) {
        this.results.push({
          name: testName,
          status: "PASS",
          duration: Date.now() - start,
        })
        console.log(`✓ ${testName} passed (${response.length} venues)`)
      } else {
        throw new Error("Invalid venues response")
      }
    } catch (error) {
      this.results.push({
        name: testName,
        status: "FAIL",
        duration: Date.now() - start,
        error: String(error),
      })
      console.error(`✗ ${testName} failed:`, error)
    }
  },

  async testFetchVenueDetails() {
    const start = Date.now()
    const testName = "Fetch Venue Details"

    try {
      const response = await venueService.getVenueById(1)

      if (response && response.id) {
        this.results.push({
          name: testName,
          status: "PASS",
          duration: Date.now() - start,
        })
        console.log(`✓ ${testName} passed`)
      } else {
        throw new Error("Invalid venue details response")
      }
    } catch (error) {
      this.results.push({
        name: testName,
        status: "FAIL",
        duration: Date.now() - start,
        error: String(error),
      })
      console.error(`✗ ${testName} failed:`, error)
    }
  },

  async testFetchEvents() {
    const start = Date.now()
    const testName = "Fetch Events"

    try {
      const response = await eventService.getEvents()

      if (Array.isArray(response) && response.length > 0) {
        this.results.push({
          name: testName,
          status: "PASS",
          duration: Date.now() - start,
        })
        console.log(`✓ ${testName} passed (${response.length} events)`)
      } else {
        throw new Error("Invalid events response")
      }
    } catch (error) {
      this.results.push({
        name: testName,
        status: "FAIL",
        duration: Date.now() - start,
        error: String(error),
      })
      console.error(`✗ ${testName} failed:`, error)
    }
  },

  async testFetchEventDetails() {
    const start = Date.now()
    const testName = "Fetch Event Details"

    try {
      const response = await eventService.getEventById(1)

      if (response && response.id) {
        this.results.push({
          name: testName,
          status: "PASS",
          duration: Date.now() - start,
        })
        console.log(`✓ ${testName} passed`)
      } else {
        throw new Error("Invalid event details response")
      }
    } catch (error) {
      this.results.push({
        name: testName,
        status: "FAIL",
        duration: Date.now() - start,
        error: String(error),
      })
      console.error(`✗ ${testName} failed:`, error)
    }
  },

  async testCreateBooking() {
    const start = Date.now()
    const testName = "Create Booking"

    try {
      // First login as user
      const loginResponse = await authService.userLogin({
        email: "user1@eventvenue.com",
        password: "password123",
      })

      const response = await bookingService.createBooking({
        venueId: 1,
        bookingStartDate: "2025-03-01",
        bookingEndDate: "2025-03-02",
        numberOfGuests: 50,
        pointsToUse: 0,
        specialRequests: "Test booking",
      })

      if (response && response.id) {
        this.results.push({
          name: testName,
          status: "PASS",
          duration: Date.now() - start,
        })
        console.log(`✓ ${testName} passed (Booking ID: ${response.id})`)
      } else {
        throw new Error("Invalid booking response")
      }
    } catch (error) {
      this.results.push({
        name: testName,
        status: "FAIL",
        duration: Date.now() - start,
        error: String(error),
      })
      console.error(`✗ ${testName} failed:`, error)
    }
  },
}

export default integrationTests
