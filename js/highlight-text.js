// Warte bis die Seite geladen ist
document.addEventListener('DOMContentLoaded', function() {
    // Hole alle Textinhalte aus dem .main-text Container
    let mainText = document.querySelector('.main-text');

    if (mainText) {
        // Hole alle Elemente die NICHT Überschriften sind
        let elements = mainText.querySelectorAll('p, section, li, div');

        // Gehe durch jedes Element und ersetze "Join" und "Developer Akademie GmbH"
        elements.forEach(function(element) {
            let htmlContent = element.innerHTML;
            // Ersetze "Developer Akademie GmbH" zuerst (damit es nicht mit Join kollidiert)
            let newContent = htmlContent.replace(/Developer Akademie GmbH/g, '<span class="highlight-join">Developer Akademie GmbH</span>');
            // Dann ersetze "Join"
            newContent = newContent.replace(/\bJoin\b/g, '<span class="highlight-join">Join</span>');
            element.innerHTML = newContent;
        });
    }
});
