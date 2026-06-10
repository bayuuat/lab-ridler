import PhotosUI
import SwiftUI

struct VerifyHabitSheet: View {
    let habit: Habit
    @ObservedObject var viewModel: DashboardViewModel
    @Environment(\.dismiss) private var dismiss

    @State private var proofText = ""
    @State private var selectedPhotoItem: PhotosPickerItem?
    @State private var selectedImage: UIImage?
    @State private var isShowingCamera = false
    @State private var isSubmitting = false

    var body: some View {
        NavigationStack {
            VStack(alignment: .leading, spacing: 18) {
                VStack(alignment: .leading, spacing: 6) {
                    Text(habit.name)
                        .font(.title2.weight(.bold))

                    if let description = habit.description, !description.isEmpty {
                        Text(description)
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                }

                switch habit.verificationType {
                case .textProof:
                    TextEditor(text: $proofText)
                        .frame(minHeight: 170)
                        .padding(8)
                        .background(Color(.secondarySystemGroupedBackground))
                        .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))

                case .imageProof:
                    imageProofBody

                case .webHook:
                    ContentUnavailableView(
                        "Webhook habit",
                        systemImage: "bolt.horizontal.fill",
                        description: Text("This habit is completed by an external integration.")
                    )
                }

                Spacer()

                Button {
                    Task { await submit() }
                } label: {
                    if isSubmitting {
                        ProgressView()
                            .frame(maxWidth: .infinity)
                    } else {
                        Label("Submit Proof", systemImage: "checkmark.circle.fill")
                            .frame(maxWidth: .infinity)
                    }
                }
                .buttonStyle(.borderedProminent)
                .controlSize(.large)
                .disabled(isSubmitDisabled)
            }
            .padding(16)
            .background(Color(.systemGroupedBackground))
            .navigationTitle("Verify")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
            }
            .onChange(of: selectedPhotoItem) { _, newValue in
                Task { await loadPhotoItem(newValue) }
            }
            .sheet(isPresented: $isShowingCamera) {
                CameraPicker(image: $selectedImage)
            }
        }
    }

    private var imageProofBody: some View {
        VStack(alignment: .leading, spacing: 12) {
            ZStack {
                RoundedRectangle(cornerRadius: 8, style: .continuous)
                    .fill(Color(.secondarySystemGroupedBackground))
                    .frame(height: 260)

                if let selectedImage {
                    Image(uiImage: selectedImage)
                        .resizable()
                        .scaledToFill()
                        .frame(maxWidth: .infinity, minHeight: 260, maxHeight: 260)
                        .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
                } else {
                    Image(systemName: "photo")
                        .font(.system(size: 42))
                        .foregroundStyle(.secondary)
                }
            }
            .clipped()

            HStack(spacing: 10) {
                PhotosPicker(selection: $selectedPhotoItem, matching: .images) {
                    Label("Gallery", systemImage: "photo.on.rectangle")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.bordered)

                Button {
                    isShowingCamera = true
                } label: {
                    Label("Camera", systemImage: "camera")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.bordered)
            }
        }
    }

    private var isSubmitDisabled: Bool {
        if isSubmitting {
            return true
        }

        switch habit.verificationType {
        case .textProof:
            return proofText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
        case .imageProof:
            return selectedImage == nil
        case .webHook:
            return true
        }
    }

    private func submit() async {
        isSubmitting = true

        switch habit.verificationType {
        case .textProof:
            await viewModel.verifyText(
                habit: habit,
                proofText: proofText.trimmingCharacters(in: .whitespacesAndNewlines)
            )
        case .imageProof:
            if let selectedImage {
                await viewModel.verifyImage(habit: habit, image: selectedImage)
            }
        case .webHook:
            break
        }

        isSubmitting = false
        dismiss()
    }

    private func loadPhotoItem(_ item: PhotosPickerItem?) async {
        guard let item else { return }

        if let data = try? await item.loadTransferable(type: Data.self),
           let image = UIImage(data: data) {
            selectedImage = image
        }
    }
}
