import SwiftUI

struct AddHabitSheet: View {
    @ObservedObject var viewModel: DashboardViewModel
    @Environment(\.dismiss) private var dismiss

    @State private var name = ""
    @State private var description = ""
    @State private var verificationType: VerificationType = .textProof
    @State private var secretKey = ""
    @State private var isSaving = false

    var body: some View {
        NavigationStack {
            Form {
                Section("Habit") {
                    TextField("Name", text: $name)
                    TextField("Description", text: $description, axis: .vertical)
                        .lineLimit(2...4)
                }

                Section("Verification") {
                    Picker("Type", selection: $verificationType) {
                        Label("Text", systemImage: "text.alignleft")
                            .tag(VerificationType.textProof)
                        Label("Photo", systemImage: "camera.fill")
                            .tag(VerificationType.imageProof)
                        Label("Webhook", systemImage: "bolt.horizontal.fill")
                            .tag(VerificationType.webHook)
                    }

                    if verificationType == .webHook {
                        TextField("Secret key", text: $secretKey)
                            .textInputAutocapitalization(.never)
                            .autocorrectionDisabled()
                    }
                }
            }
            .navigationTitle("New Habit")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }

                ToolbarItem(placement: .confirmationAction) {
                    Button {
                        Task { await save() }
                    } label: {
                        if isSaving {
                            ProgressView()
                        } else {
                            Text("Save")
                        }
                    }
                    .disabled(isSaveDisabled)
                }
            }
        }
        .presentationDetents([.medium, .large])
    }

    private var isSaveDisabled: Bool {
        isSaving || name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }

    private func save() async {
        isSaving = true

        let didCreate = await viewModel.createHabit(
            name: name.trimmingCharacters(in: .whitespacesAndNewlines),
            description: trimmedOptional(description),
            verificationType: verificationType,
            secretKey: verificationType == .webHook ? trimmedOptional(secretKey) : nil
        )

        isSaving = false

        if didCreate {
            dismiss()
        }
    }

    private func trimmedOptional(_ value: String) -> String? {
        let trimmed = value.trimmingCharacters(in: .whitespacesAndNewlines)
        return trimmed.isEmpty ? nil : trimmed
    }
}
