// app.js - Lista de Compras con Árbol Binario de Búsqueda (BST)
// Autor: Cascade

// -----------------------------
// Modelo de Datos
// -----------------------------
/**
 * Representa un producto de la lista de compras.
 * - name: nombre del producto, normalizado sin espacios al principio/fin.
 * - priority: prioridad numérica (1 = alta, 2 = media, 3 = baja). Si no es válida, se usa 3.
 * - insertedAt: marca de tiempo para desempatar productos cuando el orden lo requiera.
 */
class Product {
  constructor(name, priority) {
    this.name = name.trim();
    this.priority = Number(priority) || 3;
    this.insertedAt = Date.now(); // para desempates consistentes
  }
}

// -----------------------------
// Implementación de un BST genérico
// -----------------------------
/**
 * Nodo de un Árbol Binario de Búsqueda (BST).
 * Guarda un valor (en este caso un Product) y referencias a sus hijos izquierdo y derecho.
 */
class BSTNode {
  constructor(value) {
    this.value = value; // value es Product
    this.left = null;
    this.right = null;
  }
}

/**
 * Árbol Binario de Búsqueda genérico parametrizado por un comparador.
 * El comparador define el criterio de orden del árbol y decide la posición de cada Product.
 *
 * comparator(a, b) debe devolver:
 *  -1 si a < b, 0 si a == b, 1 si a > b bajo el criterio elegido (nombre o prioridad).
 */
class BST {
  constructor(comparator) {
    this.root = null;
    this.comparator = comparator; // (a: Product, b: Product) => -1 | 0 | 1
  }

  /**
   * Cambia el comparador activo. Útil cuando cambiamos el modo de orden.
   */
  setComparator(comparator) {
    this.comparator = comparator;
  }

  /**
   * Inserta un valor en el BST.
   * Si el comparador considera que el valor ya existe (cmp === 0), no inserta duplicados.
   * Devuelve true si insertó; false si ya existía.
   */
  insert(value) {
    if (!this.root) {
      this.root = new BSTNode(value);
      return true;
    }
    let current = this.root;
    while (true) {
      const cmp = this.comparator(value, current.value);
      if (cmp === 0) {
        // Consideramos iguales según el comparador: evitar duplicados exactos en el árbol
        return false;
      } else if (cmp < 0) {
        if (!current.left) {
          current.left = new BSTNode(value);
          return true;
        }
        current = current.left;
      } else {
        if (!current.right) {
          current.right = new BSTNode(value);
          return true;
        }
        current = current.right;
      }
    }
  }

  /**
   * Indica si el BST contiene un valor que sea "igual" según el comparador (cmp === 0).
   */
  contains(value) {
    let current = this.root;
    while (current) {
      const cmp = this.comparator(value, current.value);
      if (cmp === 0) return true;
      current = cmp < 0 ? current.left : current.right;
    }
    return false;
  }

  /**
   * Elimina del árbol el nodo cuyo valor sea "igual" al proporcionado según el comparador.
   */
  delete(value) {
    this.root = this._deleteRec(this.root, value);
  }

  /**
   * Implementación recursiva de borrado en BST con manejo de 3 casos:
   * 1) Nodo hoja. 2) Nodo con un solo hijo. 3) Nodo con dos hijos (se reemplaza por su sucesor).
   */
  _deleteRec(node, value) {
    if (!node) return null;
    const cmp = this.comparator(value, node.value);
    if (cmp < 0) {
      node.left = this._deleteRec(node.left, value);
      return node;
    } else if (cmp > 0) {
      node.right = this._deleteRec(node.right, value);
      return node;
    } else {
      // Encontrado: tres casos
      if (!node.left && !node.right) return null; // hoja
      if (!node.left) return node.right; // un hijo (derecha)
      if (!node.right) return node.left; // un hijo (izquierda)
      // dos hijos: reemplazar con sucesor (mínimo del subárbol derecho)
      const minRight = this._minNode(node.right);
      node.value = minRight.value;
      node.right = this._deleteRec(node.right, minRight.value);
      return node;
    }
  }

  /**
   * Busca el nodo con el valor mínimo (más a la izquierda) a partir de un nodo dado.
   */
  _minNode(node) {
    let current = node;
    while (current && current.left) current = current.left;
    return current;
  }

  /**
   * Devuelve un arreglo con los valores del BST en recorrido inorden.
   * Inorden ordena naturalmente según el comparador actual (alfabético o por prioridad).
   */
  inOrder() {
    const res = [];
    this._inOrderRec(this.root, res);
    return res;
  }
  _inOrderRec(node, res) {
    if (!node) return;
    this._inOrderRec(node.left, res);
    res.push(node.value);
    this._inOrderRec(node.right, res);
  }

  /**
   * Devuelve un arreglo con los valores del BST en recorrido preorden.
   */
  preOrder() {
    const res = [];
    this._preOrderRec(this.root, res);
    return res;
  }
  _preOrderRec(node, res) {
    if (!node) return;
    res.push(node.value);
    this._preOrderRec(node.left, res);
    this._preOrderRec(node.right, res);
  }

  /**
   * Devuelve un arreglo con los valores del BST en recorrido postorden.
   */
  postOrder() {
    const res = [];
    this._postOrderRec(this.root, res);
    return res;
  }
  _postOrderRec(node, res) {
    if (!node) return;
    this._postOrderRec(node.left, res);
    this._postOrderRec(node.right, res);
    res.push(node.value);
  }

  // Impresión textual del árbol (preorden con indentación)
  /**
   * Genera una representación de texto del árbol en preorden, con indentación para visualizar
   * la estructura (hijo izquierdo/derecho). Útil para depuración.
   */
  toText() {
    const lines = [];
    const walk = (node, prefix) => {
      if (!node) return;
      lines.push(`${prefix}- ${node.value.name} (P${node.value.priority})`);
      walk(node.left, prefix + '  ');
      walk(node.right, prefix + '  ');
    };
    walk(this.root, '');
    return lines.join('\n');
  }
}

// -----------------------------
// Lógica de la App
// -----------------------------
/**
 * Comparador por nombre (alfabético):
 * - Compara a.name vs b.name en minúsculas.
 * - Si empatan por nombre, desempata por prioridad (menor número = mayor prioridad).
 * - Si sigue el empate, desempata por tiempo de inserción.
 */
const byNameComparator = (a, b) => {
  const an = a.name.toLowerCase();
  const bn = b.name.toLowerCase();
  if (an < bn) return -1;
  if (an > bn) return 1;
  // si mismo nombre, usar prioridad e insertado para estabilidad
  if (a.priority !== b.priority) return a.priority - b.priority;
  return a.insertedAt - b.insertedAt;
};

/**
 * Comparador por prioridad:
 * - Primero por prioridad (1 alta, 2 media, 3 baja).
 * - Si empatan, ordena alfabéticamente por nombre.
 * - Si aún empatan, desempata por tiempo de inserción.
 */
const byPriorityComparator = (a, b) => {
  if (a.priority !== b.priority) return a.priority - b.priority; // 1 alta -> primero
  const an = a.name.toLowerCase();
  const bn = b.name.toLowerCase();
  if (an < bn) return -1;
  if (an > bn) return 1;
  return a.insertedAt - b.insertedAt;
};

// Modo de orden actual: 'name' (alfabético) o 'priority'.
let orderMode = 'name';
// Instancia del BST con el comparador por nombre por defecto.
let bst = new BST(byNameComparator);
// Mapa auxiliar para accesos O(1) por nombre normalizado y para evitar duplicados.
const productMap = new Map(); // clave: name (lowercase) -> Product

// UI refs
// Referencias a elementos del DOM.
const $name = document.getElementById('productName');
const $priority = document.getElementById('priority');
const $orderMode = document.getElementById('orderMode');
const $status = document.getElementById('status');
const $resultList = document.getElementById('resultList');
const $treeText = document.getElementById('treeText');

const $btnAdd = document.getElementById('btnAdd');
const $btnSearch = document.getElementById('btnSearch');
const $btnDelete = document.getElementById('btnDelete');
const $btnChangeOrder = document.getElementById('btnChangeOrder');
const $btnInOrder = document.getElementById('btnInOrder');
const $btnPreOrder = document.getElementById('btnPreOrder');
const $btnPostOrder = document.getElementById('btnPostOrder');

// Helpers UI
/**
 * Muestra un mensaje de estado en la interfaz.
 * type: 'info' | 'success' | 'warn' | 'error'.
 */
function setStatus(msg, type = 'info') {
  $status.textContent = msg;
  $status.className = `status ${type}`;
}

/**
 * Renderiza en la lista HTML un arreglo de productos.
 * Si está vacío, muestra un texto "(sin resultados)".
 */
function renderList(products) {
  $resultList.innerHTML = '';
  if (!products.length) {
    $resultList.innerHTML = '<li class="muted">(sin resultados)</li>';
    return;
  }
  for (const p of products) {
    const li = document.createElement('li');
    li.textContent = `${p.name} (Prioridad ${p.priority})`;
    $resultList.appendChild(li);
  }
}

/**
 * Actualiza el panel de texto del árbol con su representación actual.
 */
function refreshTreeText() {
  $treeText.textContent = bst.toText() || '(árbol vacío)';
}

/**
 * Reconstruye el BST con un nuevo modo de orden (por nombre o por prioridad),
 * reinsertando todos los productos actuales respetando el nuevo comparador.
 */
function rebuildBST(newMode) {
  orderMode = newMode;
  const cmp = orderMode === 'name' ? byNameComparator : byPriorityComparator;
  const newBST = new BST(cmp);
  for (const p of productMap.values()) {
    newBST.insert(p);
  }
  bst = newBST;
  refreshTreeText();
}

/**
 * Lee los valores actuales de los inputs de nombre y prioridad.
 * Devuelve un objeto con shape { name, priority } listo para validar o crear Product.
 */
function getInputProduct() {
  const name = ($name.value || '').trim();
  const priority = Number($priority.value || 3);
  return { name, priority };
}

/**
 * Verifica que el nombre no esté vacío.
 */
function validateName(name) {
  if (!name) {
    setStatus('Ingrese un nombre de producto.', 'warn');
    return false;
  }
  return true;
}

// Event Listeners
// Agregar producto a la lista y al BST.
$btnAdd.addEventListener('click', () => {
  const { name, priority } = getInputProduct();
  if (!validateName(name)) return;

  const key = name.toLowerCase();
  if (productMap.has(key)) {
    setStatus(`"${name}" ya existe en la lista.`, 'warn');
    return;
  }

  const product = new Product(name, priority);
  productMap.set(key, product);
  bst.insert(product);
  setStatus(`Producto agregado: ${name} (P${priority}).`, 'success');
  refreshTreeText();
});

// Buscar la existencia de un producto por nombre usando el mapa auxiliar.
$btnSearch.addEventListener('click', () => {
  const { name } = getInputProduct();
  if (!validateName(name)) return;
  const found = productMap.has(name.toLowerCase());
  if (found) {
    setStatus(`"${name}" SÍ está en la lista.`, 'success');
  } else {
    setStatus(`"${name}" NO se encuentra en la lista.`, 'error');
  }
});

// Eliminar un producto: se elimina del BST y del mapa si existe.
$btnDelete.addEventListener('click', () => {
  const { name } = getInputProduct();
  if (!validateName(name)) return;
  const key = name.toLowerCase();
  const product = productMap.get(key);
  if (!product) {
    setStatus(`No se puede eliminar: "${name}" no está en la lista.`, 'error');
    return;
  }
  bst.delete(product);
  productMap.delete(key);
  setStatus(`Producto eliminado: ${name}.`, 'success');
  refreshTreeText();
});

// Cambiar el modo de orden entre alfabético y prioridad, reconstruyendo el árbol.
$btnChangeOrder.addEventListener('click', () => {
  const mode = $orderMode.value; // 'name' | 'priority'
  rebuildBST(mode);
  setStatus(`Modo de orden aplicado: ${mode === 'name' ? 'Alfabético' : 'Prioridad'}.`, 'info');
});

// Mostrar recorrido Inorden en la lista de resultados.
$btnInOrder.addEventListener('click', () => {
  const items = bst.inOrder();
  renderList(items);
  setStatus('Recorrido: Inorden (alfabético/prioridad según modo).', 'info');
});

// Mostrar recorrido Preorden en la lista de resultados.
$btnPreOrder.addEventListener('click', () => {
  const items = bst.preOrder();
  renderList(items);
  setStatus('Recorrido: Preorden.', 'info');
});

// Mostrar recorrido Postorden en la lista de resultados.
$btnPostOrder.addEventListener('click', () => {
  const items = bst.postOrder();
  renderList(items);
  setStatus('Recorrido: Postorden.', 'info');
});

// Estado inicial
setStatus('Listo. Seleccione modo de orden y comience a gestionar la lista.');
refreshTreeText();
renderList([]);

