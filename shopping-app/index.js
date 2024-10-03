const db = new Dexie('ShoppingApp')
db.version(1).stores({ items: '++id,name,price,isPurchased' })

const itemForm = document.getElementById('itemForm')
const itemsDiv = document.getElementById('itemsDiv')
const totalPriceDiv = document.getElementById('totalPriceDiv')

const populateItemsDiv = async () => {
    const allItems = await db.items.reverse().toArray()

    itemsDiv.innerHTML = allItems.map(item => `
        <div class="item ${item.isPurchased && 'purchased'}">
        <label>
          <input 
            type="checkbox" 
            class="checkbox"
            onchange="toggleItemStatus(event, ${item.id})"
            ${item.isPurchased && 'checked'} 
            >
        </label>

        <div class="itemInfo">
          <p>${item.name}</p>
          <p>$${item.price} x ${item.quantity}</p>
        </div>

        <button class="deleteButton" onclick="removeItem(${item.id})">
      X
        </button>
      </div>
        `).join('')
    
    
    const totalPrice = allItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    totalPriceDiv.innerText = 'Total: $' + totalPrice.toFixed(2);
}

window.onload = populateItemsDiv

itemForm.onsubmit = async (event) => {
    event.preventDefault()

    const name = document.getElementById('nameInput').value.toUpperCase() //convert to uppercase to db clarity
    const quantity = parseInt(document.getElementById('quantityInput').value) //convert to int
    const price = parseFloat(document.getElementById('priceInput').value) //convert to float

    if (!name || isNaN(quantity) || quantity <= 0 || isNaN(price) || price < 0) { //checks on name quantity & price
        alert("Please enter valid quantity and price.");
        return;
    }  
  
    // Check for existing item with the same name and price
    const existingItem = await db.items.where('name').equals(name).and(item => item.price === price).first();
    if (existingItem) {
        //Add to quantity of existingItem
        existingItem.quantity += quantity
        await db.items.update(existingItem.id, { quantity: existingItem.quantity })
    }
    else {
        // Add new item
        await db.items.add({ name, quantity, price, isPurchased: false });
    }
    await populateItemsDiv()
}

const toggleItemStatus = async (event, id) => {
    await db.items.update(id, { isPurchased: !!event.target.checked })
    await populateItemsDiv()
}

const removeItem = async (id) => {
    await db.items.delete(id)
    await populateItemsDiv()
}