//
//  HabitQuestApp.swift
//  HabitQuest
//
//  Created by Bayu Aditya Triwibowo on 06/06/26.
//

import SwiftUI
#if canImport(WidgetKit)
import WidgetKit
#endif

@main
struct HabitQuestApp: App {
    init() {
        #if canImport(WidgetKit)
        WidgetCenter.shared.reloadAllTimelines()
        #endif
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
