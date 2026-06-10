import Foundation

enum VerificationType: String, Codable {
    case textProof = "TEXT_PROOF"
    case imageProof = "IMAGE_PROOF"
    case webHook = "WEB_HOOK"
}

enum HabitStatus: String, Codable {
    case pending = "PENDING"
    case completed = "COMPLETED"
}

struct Habit: Identifiable, Codable, Equatable {
    let id: String
    let name: String
    let description: String?
    let verificationType: VerificationType
    let status: HabitStatus
    let completedAt: Date?
}

struct TodayHabitsResponse: Codable {
    let habitDay: String
    let timezone: String
    let habits: [Habit]
}

struct StreakResponse: Codable {
    let userId: String
    let timezone: String
    let currentHabitDay: String
    let currentStreak: Int
    let freezeQuota: Int
    let lastEvaluatedHabitDay: String?
}

struct VerifyHabitResponse: Codable {
    let completion: HabitCompletion
}

struct CreateHabitResponse: Codable {
    let habit: CreatedHabit
}

struct SeedDemoResponse: Codable {
    let userId: String
    let created: [CreatedHabit]
    let existing: [CreatedHabit]
    let habits: [CreatedHabit]
}

struct CreatedHabit: Identifiable, Codable, Equatable {
    let id: String
    let userId: String
    let name: String
    let description: String?
    let verificationType: VerificationType
    let secretKey: String?
    let createdHabitDay: String
    let archivedAt: Date?
    let createdAt: Date
    let updatedAt: Date
}

struct HabitCompletion: Codable {
    let id: String
    let userId: String
    let habitId: String
    let habitDay: String
    let status: HabitStatus
    let proofText: String?
    let proofUrl: URL?
    let source: String
    let createdAt: Date
}

struct APIErrorResponse: Codable {
    let error: String
}
