import SwiftUI

struct DashboardView: View {
    @ObservedObject var viewModel: DashboardViewModel
    @State private var selectedHabit: Habit?
    @State private var isShowingSettings = false
    @State private var isShowingAddHabit = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    StreakHeaderView(viewModel: viewModel)

                    if let errorMessage = viewModel.errorMessage {
                        ErrorBannerView(message: errorMessage)
                    }

                    LazyVStack(spacing: 10) {
                        ForEach(viewModel.habits) { habit in
                            HabitCardView(
                                habit: habit,
                                isWaitingToSync: viewModel.pendingSyncHabitIds.contains(habit.id)
                            ) {
                                selectedHabit = habit
                            }
                        }
                    }
                }
                .padding(16)
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("HabitQuest")
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button {
                        isShowingSettings = true
                    } label: {
                        Image(systemName: "slider.horizontal.3")
                    }
                }

                ToolbarItemGroup(placement: .topBarTrailing) {
                    Button {
                        isShowingAddHabit = true
                    } label: {
                        Image(systemName: "plus")
                    }

                    Button {
                        Task { await viewModel.load() }
                    } label: {
                        Image(systemName: "arrow.clockwise")
                    }
                    .disabled(viewModel.isLoading)
                }
            }
            .refreshable {
                await viewModel.load()
            }
            .task {
                if viewModel.habits.isEmpty {
                    await viewModel.load()
                }
            }
            .sheet(item: $selectedHabit) { habit in
                VerifyHabitSheet(habit: habit, viewModel: viewModel)
            }
            .sheet(isPresented: $isShowingSettings) {
                BackendSettingsView(viewModel: viewModel)
            }
            .sheet(isPresented: $isShowingAddHabit) {
                AddHabitSheet(viewModel: viewModel)
            }
        }
    }
}

private struct StreakHeaderView: View {
    @ObservedObject var viewModel: DashboardViewModel

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(alignment: .firstTextBaseline) {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Daily streak")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)

                    HStack(spacing: 8) {
                        Image(systemName: "flame.fill")
                            .foregroundStyle(.orange)
                            .font(.system(size: 34, weight: .bold))

                        Text("\(viewModel.streak?.currentStreak ?? 0)")
                            .font(.system(size: 44, weight: .bold, design: .rounded))
                    }
                }

                Spacer()

                VStack(alignment: .trailing, spacing: 4) {
                    Text(viewModel.habitDay.isEmpty ? "-" : viewModel.habitDay)
                        .font(.headline)

                    Text(viewModel.timezone.isEmpty ? "Local timezone" : viewModel.timezone)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }

            HStack(spacing: 10) {
                SummaryPill(title: "Done", value: "\(viewModel.completedCount)", color: .green)
                SummaryPill(title: "Left", value: "\(viewModel.pendingCount)", color: .blue)
                SummaryPill(title: "Freeze", value: "\(viewModel.streak?.freezeQuota ?? 0)", color: .cyan)
            }
        }
        .padding(16)
        .background(.background)
        .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
    }
}

private struct SummaryPill: View {
    let title: String
    let value: String
    let color: Color

    var body: some View {
        HStack(spacing: 6) {
            Circle()
                .fill(color)
                .frame(width: 8, height: 8)

            Text(title)
                .font(.caption)
                .foregroundStyle(.secondary)

            Text(value)
                .font(.caption.weight(.semibold))
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 8)
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
    }
}

private struct ErrorBannerView: View {
    let message: String

    var body: some View {
        HStack(spacing: 10) {
            Image(systemName: "exclamationmark.triangle.fill")
                .foregroundStyle(.orange)

            Text(message)
                .font(.subheadline)
                .foregroundStyle(.primary)
                .frame(maxWidth: .infinity, alignment: .leading)
        }
        .padding(12)
        .background(Color.orange.opacity(0.12))
        .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
    }
}

private struct BackendSettingsView: View {
    @ObservedObject var viewModel: DashboardViewModel
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            Form {
                Section("Backend") {
                    TextField("Base URL", text: $viewModel.backendURLText)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                        .keyboardType(.URL)
                }

                Section {
                    Button {
                        dismiss()
                        Task { await viewModel.seedDemoHabits() }
                    } label: {
                        Label("Seed Demo Habits", systemImage: "sparkles")
                    }
                }
            }
            .navigationTitle("Settings")
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") {
                        dismiss()
                        Task { await viewModel.load() }
                    }
                }
            }
        }
        .presentationDetents([.medium])
    }
}
