import Foundation
import UIKit

struct APIClient {
    var baseURL: URL
    var userId: String = "00000000-0000-4000-8000-000000000001"

    private let session: URLSession
    private let decoder: JSONDecoder
    private let encoder: JSONEncoder

    init(
        baseURL: URL = URL(string: "https://hq.bayuuat.com")!,
        userId: String = "00000000-0000-4000-8000-000000000001",
        session: URLSession = .shared
    ) {
        self.baseURL = baseURL
        self.userId = userId
        self.session = session

        self.decoder = JSONDecoder.habitQuestDecoder

        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        self.encoder = encoder
    }

    func fetchTodayHabits() async throws -> TodayHabitsResponse {
        try await request(path: "/api/v1/habits/today", method: "GET")
    }

    func fetchStreak() async throws -> StreakResponse {
        try await request(path: "/api/v1/streak", method: "GET")
    }

    func createHabit(
        name: String,
        description: String?,
        verificationType: VerificationType,
        secretKey: String?
    ) async throws -> CreateHabitResponse {
        try await request(
            path: "/api/v1/habits",
            method: "POST",
            body: CreateHabitRequest(
                name: name,
                description: description,
                verificationType: verificationType,
                timezone: TimeZone.current.identifier,
                secretKey: secretKey
            )
        )
    }

    func seedDemoHabits() async throws -> SeedDemoResponse {
        try await request(
            path: "/api/v1/dev/seed",
            method: "POST",
            body: SeedDemoRequest(timezone: TimeZone.current.identifier)
        )
    }

    func verifyText(habitId: String, proofText: String) async throws -> VerifyHabitResponse {
        try await request(
            path: "/api/v1/habits/verify",
            method: "POST",
            body: VerifyHabitRequest(habitId: habitId, proofText: proofText, proofImageBase64: nil)
        )
    }

    func verifyImage(habitId: String, image: UIImage) async throws -> VerifyHabitResponse {
        guard let imageData = image.jpegData(compressionQuality: 0.72) else {
            throw APIClientError.invalidImage
        }

        return try await request(
            path: "/api/v1/habits/verify",
            method: "POST",
            body: VerifyHabitRequest(
                habitId: habitId,
                proofText: nil,
                proofImageBase64: "data:image/jpeg;base64,\(imageData.base64EncodedString())"
            )
        )
    }

    private func request<Response: Decodable>(path: String, method: String) async throws -> Response {
        try await request(path: path, method: method, body: Optional<String>.none)
    }

    private func request<RequestBody: Encodable, Response: Decodable>(
        path: String,
        method: String,
        body: RequestBody?
    ) async throws -> Response {
        let url = baseURL.appending(path: path)
        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(userId, forHTTPHeaderField: "x-user-id")

        if let body {
            request.httpBody = try encoder.encode(body)
        }

        let (data, response) = try await session.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIClientError.invalidResponse
        }

        guard (200..<300).contains(httpResponse.statusCode) else {
            if let error = try? decoder.decode(APIErrorResponse.self, from: data) {
                throw APIClientError.server(error.error)
            }

            throw APIClientError.httpStatus(httpResponse.statusCode)
        }

        return try decoder.decode(Response.self, from: data)
    }
}

private struct VerifyHabitRequest: Encodable {
    let habitId: String
    let proofText: String?
    let proofImageBase64: String?
}

private struct CreateHabitRequest: Encodable {
    let name: String
    let description: String?
    let verificationType: VerificationType
    let timezone: String
    let secretKey: String?
}

private struct SeedDemoRequest: Encodable {
    let timezone: String
}

enum APIClientError: LocalizedError {
    case invalidImage
    case invalidResponse
    case httpStatus(Int)
    case server(String)

    var errorDescription: String? {
        switch self {
        case .invalidImage:
            return "Image could not be prepared."
        case .invalidResponse:
            return "Server response was not valid."
        case .httpStatus(let statusCode):
            return "Request failed with HTTP \(statusCode)."
        case .server(let message):
            return message
        }
    }
}

private extension JSONDecoder {
    static var habitQuestDecoder: JSONDecoder {
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .custom { decoder in
            let container = try decoder.singleValueContainer()
            let value = try container.decode(String.self)

            if let date = DateFormatter.habitQuestFractionalISO8601.date(from: value) {
                return date
            }

            if let date = DateFormatter.habitQuestISO8601.date(from: value) {
                return date
            }

            throw DecodingError.dataCorruptedError(
                in: container,
                debugDescription: "Date string does not match ISO-8601 format."
            )
        }
        return decoder
    }
}

private extension DateFormatter {
    static let habitQuestFractionalISO8601: DateFormatter = {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "en_US_POSIX")
        formatter.timeZone = TimeZone(secondsFromGMT: 0)
        formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSSXXXXX"
        return formatter
    }()

    static let habitQuestISO8601: DateFormatter = {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "en_US_POSIX")
        formatter.timeZone = TimeZone(secondsFromGMT: 0)
        formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ssXXXXX"
        return formatter
    }()
}
