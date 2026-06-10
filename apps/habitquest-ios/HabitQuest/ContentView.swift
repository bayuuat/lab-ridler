//
//  ContentView.swift
//  HabitQuest
//
//  Created by Bayu Aditya Triwibowo on 06/06/26.
//

import SwiftUI

struct ContentView: View {
    @StateObject private var viewModel = DashboardViewModel()

    var body: some View {
        DashboardView(viewModel: viewModel)
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
