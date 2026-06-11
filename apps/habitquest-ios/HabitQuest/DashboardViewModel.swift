import Combine
import Foundation
import UIKit
#if canImport(WidgetKit)
import WidgetKit
#endif

@MainActor
final class DashboardViewModel: ObservableObject {
    @Published var habits: [Habit] = []
    @Published var streak: StreakResponse?
    @Published var habitDay = ""
    @Published var timezone = ""
    @Published var errorMessage: String?
    @Published var isLoading = false
    @Published var backendURLText = "https://hq.bayuuat.com"
    @Published var pendingSyncHabitIds: Set<String> = []

    private var client: APIClient {
        APIClient(baseURL: URL(string: backendURLText) ?? URL(string: "https://hq.bayuuat.com")!)
    }

    var completedCount: Int {
        habits.filter { $0.status == .completed }.count
    }

    var pendingCount: Int {
        habits.count - completedCount
    }

    func load() async {
        isLoading = true
        errorMessage = nil

        do {
            async let todayResponse = client.fetchTodayHabits()
            async let streakResponse = client.fetchStreak()

            let (today, streak) = try await (todayResponse, streakResponse)
            habits = today.habits
            habitDay = today.habitDay
            timezone = today.timezone
            self.streak = streak
        } catch {
            errorMessage = error.localizedDescription
        }

        reloadHabitWidget()
        isLoading = false
    }

    func verifyText(habit: Habit, proofText: String) async {
        await verify(habit: habit) {
            _ = try await client.verifyText(habitId: habit.id, proofText: proofText)
        }
    }

    func verifyImage(habit: Habit, image: UIImage) async {
        await verify(habit: habit) {
            _ = try await client.verifyImage(habitId: habit.id, image: image)
        }
    }

    func createHabit(
        name: String,
        description: String?,
        verificationType: VerificationType,
        secretKey: String?
    ) async -> Bool {
        errorMessage = nil

        do {
            _ = try await client.createHabit(
                name: name,
                description: description,
                verificationType: verificationType,
                secretKey: secretKey
            )
            await load()
            return true
        } catch {
            errorMessage = error.localizedDescription
            return false
        }
    }

    func seedDemoHabits() async {
        errorMessage = nil

        do {
            _ = try await client.seedDemoHabits()
            await load()
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    private func verify(habit: Habit, operation: () async throws -> Void) async {
        errorMessage = nil

        do {
            try await operation()
            pendingSyncHabitIds.remove(habit.id)
            await load()
        } catch {
            pendingSyncHabitIds.insert(habit.id)
            errorMessage = error.localizedDescription
        }
    }

    private func reloadHabitWidget() {
        #if canImport(WidgetKit)
        WidgetCenter.shared.reloadAllTimelines()
        #endif
    }
}
