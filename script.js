  
/*  ============================================
   LA CALU - CALCULATOR COMBINATII

   3 MODURI:
   1. MANCARE
   2. BAUTURI - ALGORITM NOU
   3. COMBINAT - PRIORITATE MANCARE

   Maximum 20 combinatii variate
   ============================================ */


/* ============================================
   PRODUSE SI PRETURI
   ============================================ */

const products = [

    // MENIURI

    { name: "Meniu ceafă", price: 32, unit: "buc.", max: 4, group: "menu" },
    { name: "Meniu pulpă de pui", price: 32, unit: "buc.", max: 4, group: "menu" },
    { name: "Meniu mici", price: 30, unit: "buc.", max: 4, group: "menu" },
    { name: "Meniu cârnați", price: 28, unit: "buc.", max: 4, group: "menu" },
    { name: "Meniu șnițel de pui", price: 32, unit: "buc.", max: 4, group: "menu" },
    { name: "Meniu aripioare crispy", price: 32, unit: "buc.", max: 4, group: "menu" },


    // PRODUSE LA BUCATA

    { name: "Sandwich cu șnițel de pui / Crispy pui", price: 20, unit: "buc.", max: 4, group: "piece" },
    { name: "Ciolan proaspăt", price: 60, unit: "buc.", max: 2, group: "piece" },
    { name: "Burger de pui", price: 17, unit: "buc.", max: 4, group: "piece" },
    { name: "Coastă marinată la cuptor", price: 120, unit: "kg", max: 2, group: "piece" },
    { name: "Pui la rotisor", price: 45, unit: "buc.", max: 3, group: "piece" },
    { name: "Mici", price: 6, unit: "buc.", max: 10, group: "piece" },
    { name: "Ceafă", price: 15, unit: "buc.", max: 5, group: "piece" },
    { name: "Cârnați", price: 7, unit: "buc.", max: 5, group: "piece" },


    // PRODUSE AUXILIARE

    { name: "Pâine", price: 2, unit: "buc.", max: 4, group: "extra" },
    { name: "Sos", price: 3, unit: "buc.", max: 3, group: "extra" },
    { name: "Frappe", price: 15, unit: "buc.", max: 3, group: "extra" },
    { name: "Limonadă", price: 15, unit: "buc.", max: 3, group: "extra" },


    // BAUTURI

    { name: "Bere draft", price: 7, unit: "buc.", max: 4, group: "drink" },
    { name: "Cola doză", price: 6.5, unit: "buc.", max: 4, group: "drink" },
    { name: "Fanta doză", price: 6.5, unit: "buc.", max: 4, group: "drink" },
    { name: "Sprite doză", price: 6.5, unit: "buc.", max: 4, group: "drink" },
    { name: "Cola sticlă", price: 8, unit: "buc.", max: 4, group: "drink" },
    { name: "Cafea", price: 5, unit: "buc.", max: 4, group: "drink" },
    { name: "Dorna plată", price: 6, unit: "buc.", max: 4, group: "drink" },
    { name: "Dorna minerală", price: 6, unit: "buc.", max: 4, group: "drink" },
    { name: "Fanta sticlă", price: 8, unit: "buc.", max: 4, group: "drink" },
    { name: "Bere grefă", price: 7, unit: "buc.", max: 4, group: "drink" },
    { name: "Beck's doză", price: 7, unit: "buc.", max: 4, group: "drink" },
    { name: "Bergembier doză", price: 7, unit: "buc.", max: 4, group: "drink" }

];


/* ============================================
   ELEMENTE HTML
   ============================================ */

const amountInput = document.getElementById("amount");

const resultsSection = document.getElementById("results");

const combinationsContainer =
    document.getElementById("combinations");

const countElement = document.getElementById("count");

const messageElement = document.getElementById("message");

const modeButtons = document.querySelectorAll(".mode-button");


/* ============================================
   CONFIGURARE
   ============================================ */

const MAX_COMBINATIONS = 20;

const SEARCH_ATTEMPTS = 250;

const MAX_SEARCH_NODES = 18000;

const MAX_EXTRA_QUANTITY = 6;


/* ============================================
   MOD ACTIV
   ============================================ */

let currentMode = "food";


modeButtons.forEach(button => {

    button.addEventListener("click", function() {

        if (button.disabled) return;

        currentMode = button.dataset.mode;

        modeButtons.forEach(item => {
            item.classList.remove("active");
        });

        button.classList.add("active");

        generateCombinations();

    });

});


/* ============================================
   ENTER
   ============================================ */

amountInput.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {
        generateCombinations();
    }

});


/* ============================================
   GENERARE COMBINATII
   ============================================ */

async function generateCombinations() {

    const target = Number(amountInput.value);

    combinationsContainer.innerHTML = "";

    messageElement.innerHTML = "";

    messageElement.className = "";

    countElement.textContent = "0";

    resultsSection.classList.remove("hidden");


    /* VALIDARE */

    if (!Number.isInteger(target) || target <= 0) {

        showMessage("Introdu o sumă validă.", true);

        return;

    }


    if (target > 10000) {

        showMessage(
            "Introdu o sumă de maximum 10.000 lei.",
            true
        );

        return;

    }


    /* SELECTARE PRODUSE */

    let activeProducts = [];

    if (currentMode === "food") {

        activeProducts = products.filter(
            product => product.group !== "drink"
        );

    }

    else if (currentMode === "drinks") {

        activeProducts = products.filter(
            product => product.group === "drink"
        );

    }

    else if (currentMode === "combined") {

        activeProducts = [...products];

    }


    setButtonsDisabled(true);


    try {

        const candidates = new Map();


        /* ========================================
           MOD BAUTURI - ALGORITM NOU
           ======================================== */

        if (currentMode === "drinks") {

            updateButtonText("Se calculează...");

            const drinkSolutions = generateDrinkCombinations(
                target,
                activeProducts
            );

            drinkSolutions.forEach(solution => {

                const key = solution.join(",");

                candidates.set(key, solution);

            });

        }


        /* ========================================
           MOD MANCARE SI COMBINAT
           ALGORITMUL ORIGINAL
           ======================================== */

        else {

            const menuProducts = activeProducts
                .map((product, index) => ({
                    ...product,
                    originalIndex: index
                }))
                .filter(product => product.group === "menu");


            const pieceProducts = activeProducts
                .map((product, index) => ({
                    ...product,
                    originalIndex: index
                }))
                .filter(product => product.group === "piece");


            const extraProducts = activeProducts
                .map((product, index) => ({
                    ...product,
                    originalIndex: index
                }))
                .filter(product => product.group === "extra");


            const drinkProducts = activeProducts
                .map((product, index) => ({
                    ...product,
                    originalIndex: index
                }))
                .filter(product => product.group === "drink");


            for (
                let attempt = 0;
                attempt < SEARCH_ATTEMPTS;
                attempt++
            ) {

                const searchOrder = [

                    ...shuffleArray([...menuProducts]),

                    ...shuffleArray([...pieceProducts]),

                    ...shuffleArray([...extraProducts]),

                    ...shuffleArray([...drinkProducts])

                ];


                const quantities = Array(activeProducts.length).fill(0);

                let nodes = 0;

                let solution = null;


                function search(
                    index,
                    remaining,
                    menuCount,
                    pieceCount,
                    extraCount,
                    drinkCount
                ) {

                    nodes++;

                    if (nodes > MAX_SEARCH_NODES) {
                        return false;
                    }


                    /* SUMA EXACTA */

                    if (remaining === 0) {

                        if (
                            (menuCount > 0 || pieceCount > 0) &&
                            (currentMode !== "combined" || drinkCount > 0)
                        ) {

                            solution = [...quantities];

                            return true;

                        }

                        return false;

                    }


                    if (index >= searchOrder.length) {
                        return false;
                    }


                    const product = searchOrder[index];

                    const originalIndex = product.originalIndex;


                    /* CANTITATE MAXIMA */

                    const maxQuantity = Math.min(

                        product.max,

                        Math.floor(remaining / product.price)

                    );


                    const possibleQuantities = [];

                    for (let q = 0; q <= maxQuantity; q++) {

                        possibleQuantities.push(q);

                    }


                    /* ORDINE CANTITATI */

                    if (
                        product.group === "extra" ||
                        product.group === "drink"
                    ) {

                        shuffleArray(possibleQuantities);

                        possibleQuantities.sort((a, b) => a - b);

                    }

                    else {

                        shuffleArray(possibleQuantities);

                        possibleQuantities.sort((a, b) => b - a);

                    }


                    for (const quantity of possibleQuantities) {

                        if (nodes > MAX_SEARCH_NODES) {
                            return false;
                        }


                        quantities[originalIndex] = quantity;


                        const newRemaining =
                            remaining - quantity * product.price;


                        const newMenuCount =
                            menuCount +
                            (product.group === "menu" ? quantity : 0);


                        const newPieceCount =
                            pieceCount +
                            (product.group === "piece" ? quantity : 0);


                        const newExtraCount =
                            extraCount +
                            (product.group === "extra" ? quantity : 0);


                        const newDrinkCount =
                            drinkCount +
                            (product.group === "drink" ? quantity : 0);


                        /* LIMITARE AUXILIARE */

                        if (newExtraCount > MAX_EXTRA_QUANTITY) {
                            continue;
                        }


                        if (
                            search(
                                index + 1,
                                newRemaining,
                                newMenuCount,
                                newPieceCount,
                                newExtraCount,
                                newDrinkCount
                            )
                        ) {

                            return true;

                        }

                    }


                    quantities[originalIndex] = 0;

                    return false;

                }


                search(0, target, 0, 0, 0, 0);


                /* SALVARE SOLUTIE */

                if (solution) {

                    const key = solution.join(",");

                    if (!candidates.has(key)) {

                        candidates.set(key, solution);

                    }

                }


                /* PAUZA BROWSER */

                if ((attempt + 1) % 10 === 0) {

                    updateButtonText(
                        "Se caută... " +
                        (attempt + 1) +
                        "/" +
                        SEARCH_ATTEMPTS
                    );

                    await new Promise(resolve => setTimeout(resolve, 0));

                }

            }

        }


        /* ========================================
           SELECTARE COMBINATII VARIATE
           ======================================== */

        const allCandidates = [...candidates.values()];

        const selected = selectDiverseCombinations(
            allCandidates,
            MAX_COMBINATIONS,
            activeProducts
        );


        /* ========================================
           FORMATARE
           ======================================== */

        const foundCombinations = selected.map(solution => {

            const items = [];


            solution.forEach((quantity, index) => {

                if (quantity > 0) {

                    items.push({

                        product: activeProducts[index],

                        quantity: quantity,

                        subtotal:
                            quantity * activeProducts[index].price

                    });

                }

            });


            const order = {

                menu: 1,

                piece: 2,

                drink: 3,

                extra: 4

            };


            items.sort((a, b) => {

                return (
                    order[a.product.group] -
                    order[b.product.group]
                );

            });


            return {

                items: items,

                total: target

            };

        });


        /* ========================================
           AFISARE
           ======================================== */

        countElement.textContent = foundCombinations.length;


        if (foundCombinations.length === 0) {

            let errorMessage =
                "Nu am găsit variante exacte pentru suma introdusă.";

            if (currentMode === "drinks") {

                errorMessage =
                    "Nu există o combinație exactă pentru această sumă, respectând limita de maximum 4 bucăți din fiecare sortiment.";

            }

            else if (currentMode === "combined") {

                errorMessage =
                    "Nu am găsit variante exacte cu limitele actuale de produse și băuturi.";

            }


            showMessage(errorMessage, true);

            return;

        }


        let successMessage = "";


        if (currentMode === "food") {

            successMessage =
                "Variante exacte generate cu prioritate pentru meniuri.";

        }

        else if (currentMode === "drinks") {

            successMessage =
                "Variante exacte generate fără limită totală de băuturi și cu maximum 4 bucăți din fiecare sortiment.";

        }

        else {

            successMessage =
                "Variante exacte generate cu prioritate pentru mâncare și completare cu băuturi.";

        }


        showMessage(
            "Am găsit " +
            foundCombinations.length +
            " variante exacte. " +
            successMessage,
            false
        );


        foundCombinations.forEach((combination, index) => {

            const card = createCard(combination, index + 1);

            combinationsContainer.appendChild(card);

        });


        resultsSection.scrollIntoView({

            behavior: "smooth",

            block: "start"

        });


    }

    catch (error) {

        console.error(error);

        showMessage(
            "A apărut o eroare la generarea variantelor. Încearcă din nou.",
            true
        );

    }

    finally {

        setButtonsDisabled(false);

        updateButtonText(null);

    }

}


/* ============================================
   ALGORITM NOU - DOAR BAUTURI

   Programare dinamica.

   1. Lucreaza in unitati de 0.50 lei.
   2. Verifica daca suma este realizabila.
   3. Maximum 4 bucati din fiecare sortiment.
   4. Fara limita totala de bauturi.
   5. Genereaza variante aleatorii exacte.
   ============================================ */

function generateDrinkCombinations(target, drinkProducts) {

    const MAX_DRINK_VARIANTS = 20;

    const GENERATION_ATTEMPTS = 3000;


    /* CONVERSIE IN UNITATI DE 0.50 LEI */

    const targetUnits = Math.round(target * 2);


    const prices = drinkProducts.map(product => {

        return Math.round(product.price * 2);

    });


    const limits = drinkProducts.map(product => {

        return product.max;

    });


    const productCount = drinkProducts.length;


    /* ========================================
       CONSTRUIRE TABEL DE POSIBILITATI
       ======================================== */

    const possible = Array.from(

        { length: productCount + 1 },

        () => new Uint8Array(targetUnits + 1)

    );


    /* SUMA ZERO ESTE POSIBILA */

    possible[productCount][0] = 1;


    /*
      Calculam toate sumele care pot fi obtinute
      folosind produsele ramase.
    */

    for (let i = productCount - 1; i >= 0; i--) {

        const price = prices[i];

        const maxQuantity = limits[i];

        const current = possible[i];

        const next = possible[i + 1];


        for (let sum = 0; sum <= targetUnits; sum++) {

            for (let q = 0; q <= maxQuantity; q++) {

                const remaining = sum - q * price;

                if (remaining < 0) {
                    break;
                }


                if (next[remaining]) {

                    current[sum] = 1;

                    break;

                }

            }

        }

    }


    /* ========================================
       VERIFICARE SUMA
       ======================================== */

    if (!possible[0][targetUnits]) {

        return [];

    }


    /* ========================================
       GENERARE COMBINATII EXACTE
       ======================================== */

    const candidates = new Map();


    for (
        let attempt = 0;
        attempt < GENERATION_ATTEMPTS &&
        candidates.size < 1000;
        attempt++
    ) {

        let remaining = targetUnits;

        const quantities = Array(productCount).fill(0);


        for (let i = 0; i < productCount; i++) {

            const options = [];


            /*
              Selectam numai cantitatile care permit
              completarea exacta a sumei.
            */

            for (let q = 0; q <= limits[i]; q++) {

                const rest = remaining - q * prices[i];

                if (rest < 0) {
                    break;
                }


                if (possible[i + 1][rest]) {

                    options.push(q);

                }

            }


            /*
              Amestecam cantitatile pentru a obtine
              combinatii diferite.
            */

            shuffleArray(options);


            /*
              Alegem o cantitate dintre variantele
              care permit continuarea exacta.
            */

            const chosenQuantity = options[
                Math.floor(Math.random() * options.length)
            ];


            quantities[i] = chosenQuantity;

            remaining -= chosenQuantity * prices[i];

        }


        /* VALIDARE SUMA */

        if (remaining !== 0) {
            continue;
        }


        const key = quantities.join(",");


        if (!candidates.has(key)) {

            candidates.set(key, quantities);

        }

    }


    /* ========================================
       SELECTARE VARIANTE DIVERSE
       ======================================== */

    return selectDiverseCombinations(

        [...candidates.values()],

        MAX_DRINK_VARIANTS,

        drinkProducts

    );

}


/* ============================================
   SELECTARE COMBINATII DIVERSE
   ============================================ */

function selectDiverseCombinations(
    candidates,
    limit,
    activeProducts
) {

    if (candidates.length <= limit) {
        return candidates;
    }


    /* CALCULARE SCOR */

    function calculateScore(solution) {

        let menuValue = 0;

        let pieceValue = 0;

        let extraValue = 0;

        let drinkValue = 0;


        let menuTypes = 0;

        let pieceTypes = 0;

        let extraTypes = 0;

        let drinkTypes = 0;


        let menuQuantity = 0;

        let extraQuantity = 0;

        let drinkQuantity = 0;


        solution.forEach((quantity, index) => {

            if (quantity === 0) return;


            const product = activeProducts[index];

            const value = quantity * product.price;


            if (product.group === "menu") {

                menuValue += value;

                menuTypes++;

                menuQuantity += quantity;

            }

            else if (product.group === "piece") {

                pieceValue += value;

                pieceTypes++;

            }

            else if (product.group === "extra") {

                extraValue += value;

                extraTypes++;

                extraQuantity += quantity;

            }

            else if (product.group === "drink") {

                drinkValue += value;

                drinkTypes++;

                drinkQuantity += quantity;

            }

        });


        /* MOD BAUTURI */

        if (currentMode === "drinks") {

            return (

                drinkTypes * 20 +

                drinkQuantity * 3 +

                drinkValue * 0.5

            );

        }


        /* MOD MANCARE SI COMBINAT */

        let score = (

            menuValue * 5 +

            pieceValue * 1.5 +

            menuTypes * 18 +

            pieceTypes * 7 +

            menuQuantity * 4 -

            extraValue * 2 -

            extraQuantity * 8 +

            extraTypes * 2

        );


        /* MOD COMBINAT */

        if (currentMode === "combined") {

            score -= drinkValue * 2;

            score -= drinkQuantity * 8;

            score += drinkTypes * 2;

        }


        return score;

    }


    /* SORTARE DUPA SCOR */

    const ranked = candidates

        .map(solution => ({

            solution,

            score: calculateScore(solution)

        }))

        .sort((a, b) => b.score - a.score);


    const selected = [ranked[0].solution];

    const remaining = ranked.slice(1);


    /* DISTANTA DINTRE COMBINATII */

    function calculateDistance(a, b) {

        let distance = 0;


        for (let i = 0; i < a.length; i++) {

            if (a[i] === 0 && b[i] > 0) {

                distance += 4;

            }

            else if (b[i] === 0 && a[i] > 0) {

                distance += 4;

            }

            else {

                distance += Math.min(

                    4,

                    Math.abs(a[i] - b[i])

                );

            }

        }


        return distance;

    }


    /* SELECTARE VARIANTE DIFERITE */

    while (
        selected.length < limit &&
        remaining.length > 0
    ) {

        let bestIndex = -1;

        let bestValue = -Infinity;


        for (let i = 0; i < remaining.length; i++) {

            let minimumDistance = Infinity;


            for (const chosen of selected) {

                const distance = calculateDistance(

                    remaining[i].solution,

                    chosen

                );


                minimumDistance = Math.min(

                    minimumDistance,

                    distance

                );

            }


            const value =

                remaining[i].score +

                minimumDistance * 12;


            if (value > bestValue) {

                bestValue = value;

                bestIndex = i;

            }

        }


        if (bestIndex === -1) {
            break;
        }


        selected.push(remaining[bestIndex].solution);

        remaining.splice(bestIndex, 1);

    }


    return selected;

}


/* ============================================
   CARD COMBINATIE
   ============================================ */

function createCard(combination, number) {

    const card = document.createElement("div");

    card.className = "combination";


    /* HEADER */

    const header = document.createElement("div");

    header.className = "combination-header";


    const title = document.createElement("span");

    title.className = "combination-number";

    title.textContent = "COMBINAȚIA #" + number;


    const total = document.createElement("span");

    total.className = "combination-total";

    total.textContent = combination.total + " lei";


    header.appendChild(title);

    header.appendChild(total);


    /* PRODUSE */

    const productList = document.createElement("div");


    combination.items.forEach(item => {

        const row = document.createElement("div");

        row.className = "product-line";


        const description = document.createElement("span");

        description.className = "product-description";


        description.textContent =

            item.quantity +

            " × " +

            item.product.name +

            " (" +

            item.product.price +

            " lei/" +

            item.product.unit +

            ")";


        const subtotal = document.createElement("span");

        subtotal.className = "product-subtotal";

        subtotal.textContent = item.subtotal + " lei";


        row.appendChild(description);

        row.appendChild(subtotal);


        productList.appendChild(row);

    });


    /* FOOTER */

    const footer = document.createElement("div");

    footer.className = "combination-footer";


    const productCount = document.createElement("span");

    productCount.className = "product-count";


    const totalProducts = combination.items.reduce(

        (sum, item) => sum + item.quantity,

        0

    );


    productCount.textContent =

        totalProducts +

        (totalProducts === 1 ? " produs" : " produse");


    const copyButton = document.createElement("button");

    copyButton.className = "copy-button";

    copyButton.textContent = "📋 Copiază";


    copyButton.addEventListener("click", function() {

        copyCombination(
            combination,
            number,
            copyButton
        );

    });


    footer.appendChild(productCount);

    footer.appendChild(copyButton);


    card.appendChild(header);

    card.appendChild(productList);

    card.appendChild(footer);


    return card;

}


/* ============================================
   COPIERE BON
   ============================================ */

async function copyCombination(
    combination,
    number,
    button
) {

    let text = "LA CALU - COMBINATIA #" + number + "\n\n";


    combination.items.forEach(item => {

        text +=

            item.quantity +

            " x " +

            item.product.name +

            " (" +

            item.product.price +

            " lei/" +

            item.product.unit +

            ") = " +

            item.subtotal +

            " lei\n";

    });


    text += "\nTOTAL: " + combination.total + " lei";


    try {

        await navigator.clipboard.writeText(text);

        button.textContent = "✓ Copiat";

    }

    catch (error) {

        const textarea = document.createElement("textarea");

        textarea.value = text;

        document.body.appendChild(textarea);

        textarea.select();

        document.execCommand("copy");

        textarea.remove();

        button.textContent = "✓ Copiat";

    }


    setTimeout(() => {

        button.textContent = "📋 Copiază";

    }, 2000);

}


/* ============================================
   MESAJ
   ============================================ */

function showMessage(text, error = false) {

    messageElement.textContent = text;

    messageElement.className = "message";


    if (error) {

        messageElement.classList.add("error");

    }

}


/* ============================================
   DEZACTIVARE BUTOANE
   ============================================ */

function setButtonsDisabled(disabled) {

    modeButtons.forEach(button => {

        button.disabled = disabled;

    });

}


function updateButtonText(text) {

    modeButtons.forEach(button => {

        const mode = button.dataset.mode;


        if (text) {

            if (mode === currentMode) {

                button.textContent = text;

            }

        }

        else {

            if (mode === "food") {
                button.textContent = "🍗 Mâncare";
            }

            else if (mode === "drinks") {
                button.textContent = "🥤 Băuturi";
            }

            else {
                button.textContent = "🍗 + 🥤";
            }

        }

    });

}


/* ============================================
   AMESTECARE
   ============================================ */

function shuffleArray(array) {

    for (let i = array.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        [array[i], array[j]] = [array[j], array[i]];

    }


    return array;

}