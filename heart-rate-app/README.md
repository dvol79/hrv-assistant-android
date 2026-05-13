# Heart Rate Monitor App

Кроссплатформенное мобильное приложение (Android и iOS) для подключения к Bluetooth датчикам сердечного ритма и отображения показателей в реальном времени.

## Технологии

- **React Native** с Expo
- **react-native-ble-plx** - библиотека для работы с Bluetooth Low Energy
- **Bluetooth Heart Rate Profile** - стандартный профиль для работы с пульсометрами

## Структура проекта

```
heart-rate-app/
├── App.js                          # Главный компонент приложения
├── app.json                        # Конфигурация Expo
├── package.json                    # Зависимости проекта
├── babel.config.js                 # Конфигурация Babel
├── assets/                         # Ресурсы (иконки, изображения)
└── src/
    ├── components/
    │   ├── DeviceList.js           # Компонент списка устройств
    │   └── HeartRateDisplay.js     # Компонент отображения пульса
    ├── screens/
    │   └── HomeScreen.js           # Главный экран приложения
    ├── services/
    │   └── heartRateService.js     # Сервис для работы с BLE
    └── utils/
        └── bleConstants.js         # UUID и утилиты для BLE
```

## Установка

### Предварительные требования

- Node.js 18+
- npm или yarn
- Expo CLI (`npm install -g expo-cli`)
- Для iOS: macOS с Xcode
- Для Android: Android Studio с эмулятором или физическое устройство

### Шаги установки

```bash
cd heart-rate-app

# Установите зависимости
npm install

# Запустите проект
npm start
```

### Запуск на устройствах

#### Android
```bash
npm run android
```

#### iOS (только macOS)
```bash
npm run ios
```

#### Expo Go (для тестирования)
1. Установите приложение Expo Go на телефон (iOS/Android)
2. Отсканируйте QR-код из терминала после `npm start`

## Функциональность

- 🔍 Сканирование BLE устройств с поддержкой Heart Rate Service
- 📱 Подключение к пульсометрам
- ❤️ Отображение текущего пульса в реальном времени
- 🎯 Определение зоны сердечного ритма
- 📊 Дополнительные данные: контактный статус, затраченная энергия, RR-интервалы

## Настройка разрешений

### Android

В `app.json` уже настроены необходимые разрешения:
- `BLUETOOTH_SCAN`
- `BLUETOOTH_CONNECT`
- `ACCESS_FINE_LOCATION`
- `ACCESS_COARSE_LOCATION`

Для Android 12+ требуется целевой SDK 31+.

### iOS

В `app.json` добавлены строки для Info.plist:
- `NSBluetoothAlwaysUsageDescription`
- `NSBluetoothPeripheralUsageDescription`

## Как это работает

1. Приложение сканирует устройства с UUID службы Heart Rate (0x180D)
2. При подключении обнаруживает характеристики службы
3. Подписывается на уведомления характеристики Heart Rate Measurement (0x2A37)
4. Парсит полученные данные согласно спецификации Bluetooth Heart Rate Profile

## Спецификация Bluetooth Heart Rate Service

- **Service UUID**: `0000180d-0000-1000-8000-00805f9b34fb`
- **Measurement Characteristic**: `00002a37-0000-1000-8000-00805f9b34fb`
- **Body Sensor Location**: `00002a38-0000-1000-8000-00805f9b34fb`
- **Control Point**: `00002a39-0000-1000-8000-00805f9b34fb`

## Тестирование

Для тестирования без физического устройства можно использовать:
- nRF Connect Simulator (iOS/Android)
- BlueZ на Linux с эмуляцией GATT сервера

## Известные ограничения

- Требуется физическое устройство с Bluetooth LE
- На iOS требуется реальное устройство для тестирования BLE
- Некоторые функции могут требовать сборки через EAS Build

## Лицензия

MIT
