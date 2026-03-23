import Foundation

protocol FocusRoomPreferencesStoring {
    func load() -> FocusRoomPreferences
    func save(_ preferences: FocusRoomPreferences)
}

struct UserDefaultsPreferencesStore: FocusRoomPreferencesStoring {
    private let defaults: UserDefaults
    private let key: String
    private let decoder = JSONDecoder()
    private let encoder = JSONEncoder()

    init(defaults: UserDefaults = .standard, key: String = "focus-room.preferences") {
        self.defaults = defaults
        self.key = key
    }

    func load() -> FocusRoomPreferences {
        guard
            let data = defaults.data(forKey: key),
            let preferences = try? decoder.decode(FocusRoomPreferences.self, from: data)
        else {
            return .default
        }

        return preferences
    }

    func save(_ preferences: FocusRoomPreferences) {
        guard let data = try? encoder.encode(preferences) else {
            return
        }

        defaults.set(data, forKey: key)
    }
}

final class InMemoryPreferencesStore: FocusRoomPreferencesStoring {
    private var stored: FocusRoomPreferences

    init(preferences: FocusRoomPreferences = .default) {
        stored = preferences
    }

    func load() -> FocusRoomPreferences {
        stored
    }

    func save(_ preferences: FocusRoomPreferences) {
        stored = preferences
    }
}
