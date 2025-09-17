# アイコンシステム

このフォルダにはPWAとAPK用の各種アイコンを配置します。

## 必要なアイコンサイズ

### PWA用アイコン
- `icon-72x72.png` - 72×72px
- `icon-96x96.png` - 96×96px  
- `icon-128x128.png` - 128×128px
- `icon-144x144.png` - 144×144px
- `icon-152x152.png` - 152×152px
- `icon-192x192.png` - 192×192px (推奨)
- `icon-384x384.png` - 384×384px
- `icon-512x512.png` - 512×512px (推奨)

### Web用アイコン
- `apple-touch-icon.png` - 180×180px (iOS Safari)
- `favicon-32x32.png` - 32×32px
- `favicon-16x16.png` - 16×16px

### APK用アイコン (自動生成)
Capacitorが以下を自動生成:
- `mipmap-hdpi/` - 72×72px
- `mipmap-mdpi/` - 48×48px
- `mipmap-xhdpi/` - 96×96px
- `mipmap-xxhdpi/` - 144×144px
- `mipmap-xxxhdpi/` - 192×192px

## アイコン生成方法

### 1. ベースアイコン作成
1024×1024pxのPNG形式でベースアイコンを作成

### 2. 一括リサイズ（ImageMagickの場合）
```bash
# 基本サイズ生成
convert base-icon.png -resize 72x72 icon-72x72.png
convert base-icon.png -resize 96x96 icon-96x96.png
convert base-icon.png -resize 128x128 icon-128x128.png
convert base-icon.png -resize 144x144 icon-144x144.png
convert base-icon.png -resize 152x152 icon-152x152.png
convert base-icon.png -resize 192x192 icon-192x192.png
convert base-icon.png -resize 384x384 icon-384x384.png
convert base-icon.png -resize 512x512 icon-512x512.png

# Web用
convert base-icon.png -resize 180x180 apple-touch-icon.png
convert base-icon.png -resize 32x32 favicon-32x32.png
convert base-icon.png -resize 16x16 favicon-16x16.png
```

### 3. オンラインツール使用
- [PWA Builder](https://www.pwabuilder.com/imageGenerator)
- [Favicon Generator](https://favicon.io/)
- [App Icon Generator](https://appicon.co/)

## デザインガイドライン

### PWA
- **サイズ**: 512×512px推奨
- **形式**: PNG
- **背景**: 透明またはテーマカラー
- **余白**: 10-15%程度
- **視認性**: 小さいサイズでも識別可能

### Android APK  
- **マテリアルデザイン準拠**
- **適応型アイコン対応**
- **フォアグラウンド**: 中央に配置
- **背景**: 単色またはグラデーション

### iOS PWA
- **角丸**: iOSが自動適用
- **フルブリード**: 余白なし推奨
- **高解像度**: Retina対応

## 実装状態

現在、このテンプレートにはプレースホルダーアイコンが設定されています。
実際のプロジェクトでは、以下のファイルを置き換えてください：

- [ ] `icon-192x192.png` (PWA主要アイコン)  
- [ ] `icon-512x512.png` (PWAスプラッシュ画面)
- [ ] `apple-touch-icon.png` (iOS Safari)
- [ ] `favicon-32x32.png` (ブラウザタブ)
- [ ] その他各サイズ

## 自動生成スクリプト

```bash
# アイコン自動生成スクリプト例
# process_icons.sh として保存し、chmod +x で実行可能にする

#!/bin/bash
BASE_ICON="base-icon.png"

if [ ! -f "$BASE_ICON" ]; then
  echo "❌ $BASE_ICON が見つかりません"
  exit 1
fi

echo "🎨 アイコン生成開始..."

# PWA用アイコン生成
for size in 72 96 128 144 152 192 384 512; do
  convert "$BASE_ICON" -resize ${size}x${size} "icon-${size}x${size}.png"
  echo "✅ icon-${size}x${size}.png 生成完了"
done

# Web用アイコン生成
convert "$BASE_ICON" -resize 180x180 "apple-touch-icon.png"
convert "$BASE_ICON" -resize 32x32 "favicon-32x32.png" 
convert "$BASE_ICON" -resize 16x16 "favicon-16x16.png"

echo "🎉 全アイコン生成完了！"
```