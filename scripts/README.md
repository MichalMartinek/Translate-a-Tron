# Translate-a-Tron CLI

This package contains a collection of scripts for various tasks related to translations.

## How to use

Specify TRANSLATE_O_TRON_API_KEY in env and call this command:

```bash
npx translate-o-tron-import <projectId> <lang> <operation> <filePath>
```

## Reccomended usage

1. Sync terms from primary language

   ```bash
   TRANSLATE_O_TRON_API_KEY=xxx npx translate-o-tron-import 123 cs download  ./public/locales/cs/translation.json
   ```

2. Upload translations from other languages

   ```bash
   TRANSLATE_O_TRON_API_KEY=xxx npx translate-o-tron-import 123 en upload  ./public/locales/en/translation.json
   ```

3. Download translations for all languages
   ```bash
   TRANSLATE_O_TRON_API_KEY=xxx npx translate-o-tron-import 123 cs download  ./public/locales/cs/translation.json
   TRANSLATE_O_TRON_API_KEY=xxx npx translate-o-tron-import 123 en download  ./public/locales/en/translation.json
   ```
