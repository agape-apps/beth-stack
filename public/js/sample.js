// Sample JavaScript file for the sample page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Sample page loaded!');
    
    // Add a click event to the cards
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('click', function() {
            this.style.backgroundColor = '#f5f5f5';
            setTimeout(() => {
                this.style.backgroundColor = '';
            }, 300);
        });
    });

    // Add a timestamp to the page
    const footer = document.createElement('footer');
    footer.style.marginTop = '30px';
    footer.style.textAlign = 'center';
    footer.style.color = '#999';
    footer.textContent = `Page loaded at: ${new Date().toLocaleString()}`;
    document.querySelector('.container').appendChild(footer);
});
