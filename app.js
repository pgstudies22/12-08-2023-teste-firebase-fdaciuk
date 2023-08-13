import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.0.1/firebase-app.js'
import { getFirestore, collection, addDoc, serverTimestamp, doc, deleteDoc, onSnapshot } from 'https://www.gstatic.com/firebasejs/9.0.1/firebase-firestore.js'

const firebaseConfig = {
  apiKey: "AIzaSyB7vFgjMY6sEVt0_0sPSR60gE45EQ9V5Zc",
  authDomain: "teste-firebase-8b741.firebaseapp.com",
  projectId: "teste-firebase-8b741",
  storageBucket: "teste-firebase-8b741.appspot.com",
  messagingSenderId: "849106170716",
  appId: "1:849106170716:web:4831e235fd1fd013170799"
}

const log = (...value) => console.log(...value)

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const collectionGames = collection(db, 'games')

const formAddGame = document.querySelector('[data-js="add-game-form"]')
const gamesList = document.querySelector('[data-js="games-list"]')
const buttonUnsub = document.querySelector('[data-js="unsub"]')

const getFormattedDate = createdAt => new Intl
  .DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
  .format(createdAt.toDate())

const sanitize = string => DOMPurify.sanitize(string)

const renderGamesList = querySnapshot => {
  if (!querySnapshot.metadata.hasPendingWrites) {
    gamesList.innerHTML = ''

    const games = querySnapshot.docs.map(doc => {
      const [id, { title, developedBy, createdAt }] = [doc.id, doc.data()]
      gamesList.innerHTML = ''

      const liGame = document.createElement('li')
      liGame.setAttribute('data-id', id)
      liGame.setAttribute('class', 'my-4')

      const h5 = document.createElement('h5')
      h5.textContent = sanitize(title)

      const ul = document.createElement('ul')

      const liDevelopedBy = document.createElement('li')
      liDevelopedBy.textContent = `Desenvolvido por ${sanitize(developedBy)}`

      if (createdAt) {
        const liDate = document.createElement('li')
        liDate.textContent = `Adicionado no banco em ${getFormattedDate(createdAt)}`
        ul.append(liDate)
      }

      const button = document.createElement('button')
      button.textContent = 'Remover'
      button.setAttribute('data-remove', id)
      button.setAttribute('class', 'btn btn-danger btn-sm')

      ul.append(liDevelopedBy)

      liGame.append(h5, ul, button)

      return liGame
    })

    games.forEach(game => gamesList.append(game))
  }
}

const to = promise => promise
  .then(result => [null, result])
  .catch(error => [error])

const addGame = async e => {
  e.preventDefault()

  const [error, doc] = await to(addDoc('abc', {
    title: sanitize(e.target.title.value),
    developedBy: sanitize(e.target.developer.value),
    createdAt: serverTimestamp()
  }))

  if (error) {
    return console.log(error)
  }

  log('Document criado com o ID', doc.id)
  e.target.reset()
  e.target.title.focus()
}

const deleteGame = async e => {
  const idRemoveButton = e.target.dataset.remove

  if (!idRemoveButton) {
    return
  }

  const [error] = await to(deleteDoc(doc(db, 'games', idRemoveButton)))

  if (error) {
    return log(error)
  }

  log('Game removido')
}

const handleSnapshotError = e => log(e)

const unsubscribe = onSnapshot(collectionGames, renderGamesList, handleSnapshotError)
gamesList.addEventListener('click', deleteGame)
formAddGame.addEventListener('submit', addGame)
buttonUnsub.addEventListener('click', unsubscribe)

