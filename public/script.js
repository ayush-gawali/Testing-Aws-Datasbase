const form = document.querySelector('#userForm');
const input = document.querySelector('#username');
const message = document.querySelector('#message');
const list = document.querySelector('#users');
const saveButton = form.querySelector('button');

async function loadUsers() {
  list.replaceChildren();
  try {
    const response = await fetch('/api/users');
    if (!response.ok) throw new Error('Could not load users.');
    const users = await response.json();
    if (!users.length) {
      const item = document.createElement('li');
      item.className = 'empty';
      item.textContent = 'No users yet. Add the first one!';
      list.append(item);
      return;
    }
    users.forEach(user => {
      const item = document.createElement('li');
      const name = document.createElement('span');
      name.textContent = user.username;
      const id = document.createElement('small');
      id.textContent = `#${user.id}`;
      item.append(name, id);
      list.append(item);
    });
  } catch (err) {
    const item = document.createElement('li');
    item.className = 'empty';
    item.textContent = err.message;
    list.append(item);
  }
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  saveButton.disabled = true;
  message.textContent = 'Saving…';
  try {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: input.value })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Could not save user.');
    message.textContent = `Saved ${data.username} successfully!`;
    form.reset();
    await loadUsers();
  } catch (err) {
    message.textContent = err.message;
  } finally {
    saveButton.disabled = false;
  }
});

document.querySelector('#refresh').addEventListener('click', loadUsers);
loadUsers();
