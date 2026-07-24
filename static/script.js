const tabButtons = document.querySelectorAll(".tab-button");
const tabContents = document.querySelectorAll(".tab-content");
const notification = document.getElementById("notification");

function showError(message) {
    notification.textContent = message;
    notification.classList.add("show");

    setTimeout(() => {
        notification.classList.remove("show");
    }, 3500);
}

tabButtons.forEach(button => {
    button.addEventListener("click", () => {
        tabButtons.forEach(item => item.classList.remove("active"));
        tabContents.forEach(item => item.classList.remove("active"));

        button.classList.add("active");
        document.getElementById(button.dataset.tab).classList.add("active");
    });
});

document.getElementById("swapCurrencies").addEventListener("click", () => {
    const from = document.getElementById("fromCurrency");
    const to = document.getElementById("toCurrency");

    [from.value, to.value] = [to.value, from.value];
});

document.getElementById("convertButton").addEventListener("click", async () => {
    const button = document.getElementById("convertButton");
    const amount = document.getElementById("amount").value;
    const fromCurrency = document.getElementById("fromCurrency").value;
    const toCurrency = document.getElementById("toCurrency").value;

    button.disabled = true;
    button.textContent = "Получаем курс...";

    try {
        const response = await fetch("/api/convert", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                amount: amount,
                from_currency: fromCurrency,
                to_currency: toCurrency
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error);
        }

        const formattedAmount = Number(amount).toLocaleString("ru-RU", {
            maximumFractionDigits: 2
        });

        const formattedResult = Number(data.result).toLocaleString("ru-RU", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        document.querySelector("#currencyResult h3").textContent =
            `${formattedAmount} ${fromCurrency} = ${formattedResult} ${toCurrency}`;

        document.getElementById("rateInfo").textContent =
            `1 ${fromCurrency} = ${data.rate} ${toCurrency} • курс на ${data.date}`;
    } catch (error) {
        showError(error.message || "Произошла ошибка.");
    } finally {
        button.disabled = false;
        button.textContent = "Конвертировать";
    }
});

document.getElementById("swapLanguages").addEventListener("click", () => {
    const source = document.getElementById("sourceLanguage");
    const target = document.getElementById("targetLanguage");

    if (source.value === "auto") {
        showError("Сначала выберите исходный язык вручную.");
        return;
    }

    [source.value, target.value] = [target.value, source.value];

    const sourceText = document.getElementById("sourceText");
    const translatedText = document.getElementById("translatedText");
    [sourceText.value, translatedText.value] =
        [translatedText.value, sourceText.value];
});

document.getElementById("clearButton").addEventListener("click", () => {
    document.getElementById("sourceText").value = "";
    document.getElementById("translatedText").value = "";
});

document.getElementById("translateButton").addEventListener("click", async () => {
    const button = document.getElementById("translateButton");
    const text = document.getElementById("sourceText").value;
    const source = document.getElementById("sourceLanguage").value;
    const target = document.getElementById("targetLanguage").value;

    button.disabled = true;
    button.textContent = "Переводим...";

    try {
        const response = await fetch("/api/translate", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                text: text,
                source: source,
                target: target
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error);
        }

        document.getElementById("translatedText").value =
            data.translated_text;
    } catch (error) {
        showError(error.message || "Произошла ошибка.");
    } finally {
        button.disabled = false;
        button.textContent = "Перевести";
    }
});
