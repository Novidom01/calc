from flask import Flask, render_template, request, jsonify
import requests
from deep_translator import GoogleTranslator

app = Flask(__name__)

CURRENCIES = {
    "RUB": "Российский рубль",
    "USD": "Доллар США",
    "EUR": "Евро",
    "CNY": "Китайский юань",
    "GBP": "Британский фунт",
    "JPY": "Японская иена",
    "CHF": "Швейцарский франк",
    "CAD": "Канадский доллар",
    "AUD": "Австралийский доллар",
    "TRY": "Турецкая лира",
    "PLN": "Польский злотый",
    "KZT": "Казахстанский тенге",
}

LANGUAGES = {
    "auto": "Автоопределение",
    "ru": "Русский",
    "en": "Английский",
    "de": "Немецкий",
    "fr": "Французский",
    "es": "Испанский",
    "it": "Итальянский",
    "pt": "Португальский",
    "zh-CN": "Китайский",
    "ja": "Японский",
    "ko": "Корейский",
    "tr": "Турецкий",
    "pl": "Польский",
    "uk": "Украинский",
    "kk": "Казахский",
}


@app.route("/")
def index():
    return render_template(
        "index.html",
        currencies=CURRENCIES,
        languages=LANGUAGES
    )


@app.route("/api/convert", methods=["POST"])
def convert_currency():
    data = request.get_json()

    try:
        amount = float(str(data.get("amount", "")).replace(",", "."))
        if amount < 0:
            raise ValueError
    except (ValueError, TypeError):
        return jsonify({"error": "Введите корректную положительную сумму."}), 400

    from_currency = data.get("from_currency")
    to_currency = data.get("to_currency")

    if from_currency not in CURRENCIES or to_currency not in CURRENCIES:
        return jsonify({"error": "Выбрана неизвестная валюта."}), 400

    if from_currency == to_currency:
        return jsonify({
            "result": amount,
            "rate": 1,
            "date": "сегодня"
        })

    try:
        response = requests.get(
            f"https://api.frankfurter.dev/v2/rate/{from_currency}/{to_currency}",
            timeout=10
        )
        response.raise_for_status()
        exchange_data = response.json()

        rate = exchange_data["rate"]
        result = amount * rate

        return jsonify({
            "result": round(result, 2),
            "rate": round(rate, 4),
            "date": exchange_data.get("date", "")
        })
    except (requests.RequestException, KeyError, ValueError):
        return jsonify({
            "error": "Не удалось получить курс. Проверьте интернет-соединение."
        }), 503


@app.route("/api/translate", methods=["POST"])
def translate_text():
    data = request.get_json()

    text = str(data.get("text", "")).strip()
    source = data.get("source")
    target = data.get("target")

    if not text:
        return jsonify({"error": "Введите текст для перевода."}), 400

    if source not in LANGUAGES or target not in LANGUAGES or target == "auto":
        return jsonify({"error": "Выберите корректные языки."}), 400

    try:
        translated_text = GoogleTranslator(
            source=source,
            target=target
        ).translate(text)

        return jsonify({"translated_text": translated_text})
    except Exception:
        return jsonify({
            "error": "Не удалось выполнить перевод. Попробуйте ещё раз."
        }), 503


if __name__ == "__main__":
    app.run(debug=True)
