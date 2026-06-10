import SwiftUI

struct HabitCardView: View {
    let habit: Habit
    let isWaitingToSync: Bool
    let onVerify: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(alignment: .top, spacing: 12) {
                statusIcon

                VStack(alignment: .leading, spacing: 5) {
                    Text(habit.name)
                        .font(.headline)
                        .foregroundStyle(.primary)
                        .lineLimit(2)

                    if let description = habit.description, !description.isEmpty {
                        Text(description)
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                            .lineLimit(3)
                    }
                }

                Spacer(minLength: 8)

                verificationBadge
            }

            HStack {
                if isWaitingToSync {
                    Label("Waiting to sync", systemImage: "icloud.and.arrow.up")
                        .font(.caption.weight(.medium))
                        .foregroundStyle(.orange)
                } else if habit.status == .completed {
                    Label("Completed", systemImage: "checkmark.circle.fill")
                        .font(.caption.weight(.medium))
                        .foregroundStyle(.green)
                }

                Spacer()

                if habit.status == .pending {
                    Button {
                        onVerify()
                    } label: {
                        Label("Verify", systemImage: buttonIconName)
                    }
                    .buttonStyle(.borderedProminent)
                    .controlSize(.small)
                }
            }
        }
        .padding(14)
        .background(.background)
        .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
    }

    private var statusIcon: some View {
        Image(systemName: habit.status == .completed ? "checkmark.circle.fill" : "circle")
            .font(.title3)
            .foregroundStyle(habit.status == .completed ? .green : .secondary)
            .frame(width: 28, height: 28)
    }

    private var verificationBadge: some View {
        Image(systemName: badgeIconName)
            .font(.subheadline.weight(.semibold))
            .foregroundStyle(.white)
            .frame(width: 32, height: 32)
            .background(badgeColor)
            .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
    }

    private var badgeIconName: String {
        switch habit.verificationType {
        case .textProof:
            return "text.alignleft"
        case .imageProof:
            return "camera.fill"
        case .webHook:
            return "bolt.horizontal.fill"
        }
    }

    private var buttonIconName: String {
        switch habit.verificationType {
        case .textProof:
            return "square.and.pencil"
        case .imageProof:
            return "camera"
        case .webHook:
            return "bolt.horizontal"
        }
    }

    private var badgeColor: Color {
        switch habit.verificationType {
        case .textProof:
            return .indigo
        case .imageProof:
            return .teal
        case .webHook:
            return .orange
        }
    }
}
