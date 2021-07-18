document.addEventListener('contextmenu', event => event.preventDefault());

const cellSize = 64;
const slotSize = 72;
const cellSpacing = 0;
const pixelSize = 4;

const mouseStates = {
  PRESSED: 'pressed',
  RELEASED: 'released'
};

let mouseItemStack;
let prevLeftMouseButtonState = mouseStates.RELEASED;
let prevRightMouseButtonState = mouseStates.RELEASED;

const assetTypes = {
  ITEMS: 'items',
  GUI: 'gui'
};

const assetsToScaleQueue = [];
const assets = new Map();
assets.set(assetTypes.GUI, new Map());
assets.set(assetTypes.ITEMS, new Map());

const items = {};

let inventory;

// Returns a scaled-up copy
function scaleImage(image, scale) {
  const width = image.width * scale;
  const height = image.height * scale;

  const temp = createImage(width, height);

  image.loadPixels();
  temp.loadPixels();
  for (let j = 0; j < height; j++) {
    for (let i = 0; i < width; i++) {
      const x = Math.floor(i / scale);
      const y = Math.floor(j / scale);
      const c = image.get(x, y);
      temp.set(i, j, image.get(x, y));
    }
  }
  image.updatePixels();
  temp.updatePixels();

  return temp;
}

class Item {
  constructor(img) {
    this.img = img;
    this.maxStackSize = 64;
  }

  draw(x, y, width, height) {
    image(this.img, x, y, width, height);
  }
}

class ItemStack {
  constructor(item, size) {
    this.item = item;
    this.size = size;
  }

  draw(x, y, width, height) {
    this.item.draw(x, y, width, height);
    fill(255);
    textAlign(RIGHT);
    text(this.size, x + cellSize - 6, y + cellSize - 6);
  }

  copy() {
    return new ItemStack(this.item, this.size);
  }
}

class InventorySlot {
  constructor(gridX, gridY, itemStack) {
    this.gridX = gridX;
    this.gridY = gridY;
    this.itemStack = itemStack;
  }

  isEmpty() {
    return !this.itemStack;
  }

  draw(inventoryX, inventoryY, hovered) {
    const itemSlotImage = getAsset(assetTypes.GUI, 'item_slot');
    const slotScreenX = inventoryX + (slotSize + cellSpacing) * this.gridX;
    const slotScreenY = inventoryY + (slotSize + cellSpacing) * this.gridY;
    image(itemSlotImage, slotScreenX, slotScreenY, slotSize, slotSize);

    if (this.itemStack) {
      this.itemStack.draw(slotScreenX + pixelSize, slotScreenY + pixelSize, cellSize, cellSize);
    }

    if (hovered) {
      noStroke();
      fill(255, 255, 255, 100);
      rect(slotScreenX + pixelSize, slotScreenY + pixelSize, cellSize, cellSize);
    }
  }
}

class Inventory {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.slots = [];

    // Init grid
    for (let j = 0; j < this.height; j++) {
      const row = [];
      this.slots.push(row);
      for (let i = 0; i < this.width; i++) {
        row.push(new InventorySlot(i, j, null));
      }
    }
  }

  getSlot(x, y) {
    return this.slots[y][x];
  }

  getItemStack(x, y) {
    return this.getSlot(x, y)?.itemStack;
  }

  setItemStack(x, y, itemStack) {
    const slot = this.getSlot(x, y);
    if (slot.isEmpty()) {
      slot.itemStack = itemStack;
      return true;
    }
    return false;
  }

  addItemStack(itemStack) {
    const slot = this.findFirstFreeSlotOfType(itemStack.item);

    if (!slot) {
      return false;
    } else if (slot.isEmpty()) {
      this.setItemStack(slot.gridX, slot.gridY, itemStack);
    } else {
      slot.itemStack.size += itemStack.size;
    }
  }

  findFirstFreeSlotOfType(item) {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const slot = this.getSlot(x, y);
        if (slot.isEmpty() || (slot.itemStack?.item === item)) {
          return slot;
        }
      }
    }
    return null;
  }

  draw() {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const slot = this.getSlot(x, y);
        slot.draw(this.x, this.y, this.isSlotHovered(slot));
      }
    }
  }

  isSlotHovered(slot) {
    const slotScreenX = this.x + (slotSize + cellSpacing) * slot.gridX;
    const slotScreenY = this.y + (slotSize + cellSpacing) * slot.gridY;
    return mouseX >= slotScreenX && mouseX < slotScreenX + slotSize && mouseY >= slotScreenY && mouseY < slotScreenY + slotSize;
  }

  getHoveredSlot() {
    for (let j = 0; j < this.height; j++) {
      for (let i = 0; i < this.width; i++) {
        const slot = this.getSlot(i, j);
        if (this.isSlotHovered(slot)) {
          return slot;
        }
      }
    }
    return null;
  }
}

function mouseClicked() {
  const slot = inventory.getHoveredSlot();
  if (mouseItemStack && slot?.itemStack) {
    const tmp = mouseItemStack;
    mouseItemStack = slot.itemStack;
    slot.itemStack = tmp;
  } else if (mouseItemStack) {
    slot.itemStack = mouseItemStack;
    mouseItemStack = null;
  } else if (slot?.itemStack) {
    mouseItemStack = slot.itemStack;
    slot.itemStack = null;
  }
}

// function leftMouseButtonClicked() {
//   const slot = inventory.getHoveredSlot();
//   if (mouseItemStack && slot?.itemStack) {
//     if (mouseItemStack.item !== slot.itemStack.item) {
//       const tmp = mouseItemStack;
//       mouseItemStack = slot.itemStack;
//       slot.itemStack = tmp;
//     } else {
//       slot.itemStack.size += mouseItemStack.size;
//       mouseItemStack = null;
//     }
//   } else if (mouseItemStack) {
//     slot.itemStack = mouseItemStack;
//     mouseItemStack = null;
//   } else if (slot?.itemStack) {
//     mouseItemStack = slot.itemStack;
//     slot.itemStack = null;
//   }
// }
//
// function rightMouseButtonClicked() {
//   const slot = inventory.getHoveredSlot();
//   if (mouseItemStack && slot?.itemStack) {
//     if (mouseItemStack.item !== slot.itemStack.item) {
//       // Do nothing
//     } else {
//       slot.itemStack.size++;
//       mouseItemStack.size--;
//       if (mouseItemStack.size <= 0) {
//         mouseItemStack = null;
//       }
//     }
//   } else if (mouseItemStack) {
//     slot.itemStack = mouseItemStack.copy();
//     slot.itemStack.size = 1;
//     mouseItemStack.size--;
//     if (mouseItemStack.size <= 0) {
//       mouseItemStack = null;
//     }
//   } else if (slot?.itemStack) {
//     mouseItemStack = slot.itemStack.copy();
//     slot.itemStack.size = Math.floor(slot.itemStack.size / 2);
//     mouseItemStack.size -= slot.itemStack.size;
//     if (slot.itemStack.size <= 0) {
//       slot.itemStack = null;
//     }
//   }
// }

// function mousePressed(event) {
//   if (event.button === 0) {
//     if (prevLeftMouseButtonState === mouseStates.RELEASED) {
//       leftMouseButtonClicked();
//     }
//     prevLeftMouseButtonState = mouseStates.PRESSED;
//   } else if (event.button === 2) {
//     if (prevRightMouseButtonState === mouseStates.RELEASED) {
//       rightMouseButtonClicked();
//     }
//     prevRightMouseButtonState = mouseStates.PRESSED;
//   }
// }

// function mouseReleased(event) {
//   if (event.button === 0) {
//     prevLeftMouseButtonState = mouseStates.RELEASED;
//   } else if (event.button === 2) {
//     prevRightMouseButtonState = mouseStates.RELEASED;
//   }
// }

function getAsset(type, name) {
  const assetMap = assets.get(type);
  if (assetMap) {
    const asset = assetMap.get(name);
    if (asset) {
      return asset;
    }
    console.error('Could not find asset \'' + name + '\' of type \'' + type + '\'!');
  } else {
    console.error('Could not find asset type \'' + type + '\'!');
  }
  return null;
}

function setAsset(type, name, asset) {
  const assetMap = assets.get(type);
  if (assetMap) {
    assetMap.set(name, asset);
  } else {
    console.error('Could not find asset type \'' + type + '\'!');
  }
}

function addAsset(type, name, scale) {
  const displayName = name.split('.')[0];
  const path = 'assets/' + type + '/' + name;
  setAsset(type, displayName, loadImage(path));

  if (scale != null) {
    assetsToScaleQueue.push({ type, name: displayName, scale });
  }
}

function scaleUpAsset(type, name, scale) {
  const original = getAsset(type, name);
  const scaled = scaleImage(original, scale);
  setAsset(type, name, scaled);
}

function preload() {
  const { ITEMS, GUI } = assetTypes;
  addAsset(ITEMS, 'iron_axe.png', 4);
  addAsset(ITEMS, 'iron_boots.png', 4);
  addAsset(ITEMS, 'iron_chestplate.png', 4);
  addAsset(ITEMS, 'iron_helmet.png', 4);
  addAsset(ITEMS, 'iron_hoe.png', 4);
  addAsset(ITEMS, 'iron_ingot.png', 4);
  addAsset(ITEMS, 'iron_leggings.png', 4);
  addAsset(ITEMS, 'iron_nugget.png', 4);
  addAsset(ITEMS, 'iron_pickaxe.png', 4);
  addAsset(ITEMS, 'iron_shovel.png', 4);
  addAsset(ITEMS, 'iron_sword.png', 4);
  addAsset(ITEMS, 'stick.png', 4);
  addAsset(ITEMS, 'candle.png', 4);

  addAsset(GUI, 'crafting_table.png');
  addAsset(GUI, 'item_slot.png', 4);
}

function setup() {
  createCanvas(800, 800);

  assetsToScaleQueue.forEach(({ type, name, scale }) => scaleUpAsset(type, name, scale));

  const { ITEMS } = assetTypes;
  items.STICK = new Item(getAsset(ITEMS, 'stick'));
  items.IRON_INGOT = new Item(getAsset(ITEMS, 'iron_ingot'));
  items.CANDLE = new Item(getAsset(ITEMS, 'candle'));

  inventory = new Inventory(0, 0, 10, 10);

  inventory.addItemStack(new ItemStack(items.STICK, 1));
  inventory.addItemStack(new ItemStack(items.STICK, 2));
  inventory.addItemStack(new ItemStack(items.IRON_INGOT, 1));
  inventory.addItemStack(new ItemStack(items.IRON_INGOT, 2));
  inventory.addItemStack(new ItemStack(items.STICK, 3));
  inventory.addItemStack(new ItemStack(items.IRON_INGOT, 3));
  inventory.setItemStack(0, 1, new ItemStack(items.IRON_INGOT, 10));
  inventory.setItemStack(2, 1, new ItemStack(items.IRON_INGOT, 10));
  inventory.setItemStack(2, 1, new ItemStack(items.IRON_INGOT, 20));
  inventory.setItemStack(1, 1, new ItemStack(items.IRON_INGOT, 20));
}

function draw() {
  background(220);

  inventory.draw();

  if (mouseItemStack) {
    mouseItemStack.draw(mouseX - cellSize / 2, mouseY - cellSize / 2 - 4, cellSize, cellSize);
  }
}
