import WidgetKit
import SwiftUI

struct HabitWidgetProvider: TimelineProvider {
    func placeholder(in context: Context) -> HabitWidgetEntry {
        HabitWidgetEntry(date: Date(), snapshot: .placeholder)
    }

    func getSnapshot(in context: Context, completion: @escaping (HabitWidgetEntry) -> Void) {
        if context.isPreview {
            completion(HabitWidgetEntry(date: Date(), snapshot: .placeholder))
            return
        }

        Task {
            let snapshot = await HabitWidgetService().loadSnapshot()
            completion(HabitWidgetEntry(date: Date(), snapshot: snapshot))
        }
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<HabitWidgetEntry>) -> Void) {
        Task {
            let snapshot = await HabitWidgetService().loadSnapshot()
            let entry = HabitWidgetEntry(date: Date(), snapshot: snapshot)
            let refreshDate = Calendar.current.date(byAdding: .minute, value: 15, to: Date()) ?? Date()
            completion(Timeline(entries: [entry], policy: .after(refreshDate)))
        }
    }
}

struct HabitWidgetEntry: TimelineEntry {
    let date: Date
    let snapshot: HabitWidgetSnapshot
}

struct HabitWidgetSnapshot {
    let streak: Int
    let done: Int
    let left: Int
    let habitDay: String
    let pendingHabitNames: [String]
    let errorMessage: String?

    static let placeholder = HabitWidgetSnapshot(
        streak: 7,
        done: 2,
        left: 1,
        habitDay: "Today",
        pendingHabitNames: ["Daily coding"],
        errorMessage: nil
    )
}

struct HabitWidgetEntryView : View {
    let entry: HabitWidgetEntry
    @Environment(\.widgetFamily) private var family

    var body: some View {
        Group {
            if family == .systemMedium {
                mediumLayout
            } else {
                smallLayout
            }
        }
        .containerBackground(.background, for: .widget)
    }

    private var smallLayout: some View {
        VStack(alignment: .leading, spacing: 10) {
            widgetHeader

            if let errorMessage = entry.snapshot.errorMessage {
                Text(errorMessage)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .lineLimit(3)
            } else {
                HStack(alignment: .lastTextBaseline, spacing: 6) {
                    Text("\(entry.snapshot.streak)")
                        .font(.system(size: family == .systemSmall ? 38 : 44, weight: .bold, design: .rounded))

                    Text("day streak")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(.secondary)
                }

                HStack(spacing: 8) {
                    HabitWidgetMetric(title: "Done", value: entry.snapshot.done, color: .green)
                    HabitWidgetMetric(title: "Left", value: entry.snapshot.left, color: .blue)
                }
            }

            Spacer(minLength: 0)

            Text(entry.snapshot.habitDay)
                .font(.caption2)
                .foregroundStyle(.secondary)
                .lineLimit(1)
        }
    }

    private var mediumLayout: some View {
        HStack(alignment: .top, spacing: 14) {
            VStack(alignment: .leading, spacing: 9) {
                widgetHeader

                if let errorMessage = entry.snapshot.errorMessage {
                    Text(errorMessage)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .lineLimit(4)
                } else {
                    HStack(alignment: .lastTextBaseline, spacing: 6) {
                        Text("\(entry.snapshot.streak)")
                            .font(.system(size: 38, weight: .bold, design: .rounded))

                        Text("day streak")
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(.secondary)
                    }

                    HStack(spacing: 8) {
                        HabitWidgetMetric(title: "Done", value: entry.snapshot.done, color: .green)
                        HabitWidgetMetric(title: "Left", value: entry.snapshot.left, color: .blue)
                    }
                }

                Spacer(minLength: 0)

                Text(entry.snapshot.habitDay)
                    .font(.caption2)
                    .foregroundStyle(.secondary)
                    .lineLimit(1)
            }
            .frame(maxWidth: .infinity, alignment: .leading)

            if entry.snapshot.errorMessage == nil {
                Divider()

                HabitWidgetPendingList(
                    habitNames: entry.snapshot.pendingHabitNames,
                    leftCount: entry.snapshot.left
                )
                .frame(maxWidth: .infinity, alignment: .leading)
            }
        }
    }

    private var widgetHeader: some View {
        HStack(alignment: .firstTextBaseline) {
            Text("HabitQuest")
                .font(.headline)

            Spacer()

            Image(systemName: "flame.fill")
                .foregroundStyle(.orange)
        }
    }
}

struct HabitWidget: Widget {
    let kind: String = "HabitWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: HabitWidgetProvider()) { entry in
            HabitWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("HabitQuest")
        .description("Track today's streak and habit progress.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

private struct HabitWidgetMetric: View {
    let title: String
    let value: Int
    let color: Color

    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(title)
                .font(.caption2)
                .foregroundStyle(.secondary)

            HStack(spacing: 4) {
                Circle()
                    .fill(color)
                    .frame(width: 6, height: 6)

                Text("\(value)")
                    .font(.caption.weight(.bold))
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

private struct HabitWidgetPendingList: View {
    let habitNames: [String]
    let leftCount: Int

    private var visibleHabitNames: ArraySlice<String> {
        habitNames.prefix(4)
    }

    private var hiddenCount: Int {
        max(leftCount - visibleHabitNames.count, 0)
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 7) {
            Text("Next up")
                .font(.caption.weight(.bold))
                .foregroundStyle(.secondary)

            if habitNames.isEmpty {
                HStack(spacing: 6) {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.caption)
                        .foregroundStyle(.green)

                    Text("All clear")
                        .font(.caption.weight(.semibold))
                        .lineLimit(1)
                }
            } else {
                ForEach(Array(visibleHabitNames.enumerated()), id: \.offset) { _, habitName in
                    HStack(alignment: .firstTextBaseline, spacing: 6) {
                        Image(systemName: "circle")
                            .font(.caption2)
                            .foregroundStyle(.blue)

                        Text(habitName)
                            .font(.caption)
                            .lineLimit(1)
                    }
                }

                if hiddenCount > 0 {
                    Text("+\(hiddenCount) more")
                        .font(.caption2.weight(.semibold))
                        .foregroundStyle(.secondary)
                        .lineLimit(1)
                }
            }
        }
    }
}

private struct HabitWidgetService {
    private let baseURL = URL(string: "https://hq.bayuuat.com")!
    private let userId = "00000000-0000-4000-8000-000000000001"

    func loadSnapshot() async -> HabitWidgetSnapshot {
        do {
            async let today = request(path: "/api/v1/habits/today", responseType: WidgetTodayResponse.self)
            async let streak = request(path: "/api/v1/streak", responseType: WidgetStreakResponse.self)
            let (todayResponse, streakResponse) = try await (today, streak)
            let done = todayResponse.habits.filter { $0.status == "COMPLETED" }.count
            let left = max(todayResponse.habits.count - done, 0)

            return HabitWidgetSnapshot(
                streak: streakResponse.currentStreak,
                done: done,
                left: left,
                habitDay: todayResponse.habitDay,
                pendingHabitNames: todayResponse.habits
                    .filter { $0.status != "COMPLETED" }
                    .map(\.name),
                errorMessage: nil
            )
        } catch {
            return HabitWidgetSnapshot(
                streak: 0,
                done: 0,
                left: 0,
                habitDay: "Offline",
                pendingHabitNames: [],
                errorMessage: "API: \(Self.describe(error))"
            )
        }
    }

    private func request<Response: Decodable>(path: String, responseType: Response.Type) async throws -> Response {
        var request = URLRequest(url: baseURL.appending(path: path))
        request.setValue(userId, forHTTPHeaderField: "x-user-id")

        let (data, response) = try await URLSession.shared.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse,
              (200..<300).contains(httpResponse.statusCode) else {
            throw URLError(.badServerResponse)
        }

        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        return try decoder.decode(Response.self, from: data)
    }

    private static func describe(_ error: Error) -> String {
        if let urlError = error as? URLError {
            switch urlError.code {
            case .cannotConnectToHost:
                return "cannot connect"
            case .notConnectedToInternet:
                return "no network"
            case .timedOut:
                return "timeout"
            case .appTransportSecurityRequiresSecureConnection:
                return "ATS blocked HTTP"
            default:
                return urlError.localizedDescription
            }
        }

        if let decodingError = error as? DecodingError {
            switch decodingError {
            case .dataCorrupted:
                return "decode: corrupted data"
            case .keyNotFound(let key, _):
                return "decode: missing \(key.stringValue)"
            case .typeMismatch:
                return "decode: type mismatch"
            case .valueNotFound:
                return "decode: value missing"
            @unknown default:
                return "decode failed"
            }
        }

        return error.localizedDescription
    }
}

private struct WidgetTodayResponse: Decodable {
    let habitDay: String
    let habits: [WidgetHabit]
}

private struct WidgetHabit: Decodable {
    let name: String
    let status: String
}

private struct WidgetStreakResponse: Decodable {
    let currentStreak: Int
}
