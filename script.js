const player = document.querySelector('.player'),
    audio = document.querySelector('.audio'),
    song_title = document.querySelector('.song_title'),
    song_img_src = document.querySelector('.song_img_src'),
    progressBar = document.querySelector('.progress_bar'),
    progress = document.querySelector('.progress'),
    prevBtn = document.querySelector('.prev'),
    nextBtn = document.querySelector('.next'),
    playBtn = document.querySelector('.play'),
    btn_img = document.querySelector('.play_btn'),
    volumeBtn = document.querySelector('.sound_btn'),
    songDuration = document.querySelector('.duration'),
    currentSongTime = document.querySelector('.current_time'),
    songAutor = document.querySelector('.autor')

// массив названий песен
const songs = ['Show Must Go On', 'Empire State Of Mind', 'Юность-89',
    'Back To Black', 'Moscow Never Sleeps', 'I Will Survive',
    'Dangerous Woman', 'I Was Made For Lovin You']
const autors = ['Queen', 'Jay-Z, Alicia Keys', 'ATL',
    'Amy Winehouse', 'DJ Smash', 'Gloria Gaynor',
    'Ariana Grande', 'Kiss']

// песня по умолчанию
let song_index = 0

// функция загрузки песни: title, image, audio
function loadSong(song) {
    song_title.innerHTML = song
    songAutor.innerHTML = autors[song_index]
    audio.src = 'songs/' + song + '.mp3'
    song_img_src.src = 'imgs/' + song + '.svg'
}

// загружаем песню
loadSong(songs[song_index])

// получение столбиков эквалайзера
let line = document.getElementsByClassName('line')
line = Array.from(line)

// делим столбики на 2 половины для левой и правой части
let left_side = line.slice(0, line.length / 2),
    right_side = line.slice(line.length / 2, line.length)

let context, analyser

// проигрывание
function playSong() {
    // проверяем первый раз ли запускатся песня
    if (!context) {
        preparation()
    }
    player.classList.add('played')
    audio.play()
    btn_img.src = 'icons/pause.svg'
    loop()
}

// пауза
function pauseSong() {
    player.classList.remove('played')
    audio.pause()
    btn_img.src = 'icons/play.svg'
}

// переключение вперед
function nextSong() {
    song_index++
    // сбрасываем индекс если это последняя песня
    if (song_index >= songs.length) {
        song_index = 0
    }
    // загружаем и запускаем
    loadSong(songs[song_index])
    playSong()
}
nextBtn.addEventListener('click', nextSong)

// переключение назад
function prevSong() {
    song_index--
    // включаем последнюю песню если это была первая
    if (song_index < 0) {
        song_index = songs.length - 1
    }
    loadSong(songs[song_index])
    playSong()
}
prevBtn.addEventListener('click', prevSong)

// выключение звука
function soundOff() {
    player.classList.remove('sounded')
    audio.volume = 0
    volumeBtn.src = 'icons/soundoff.svg'
}

// включение звука
function soundOn() {
    player.classList.add('sounded')
    audio.volume = 1
    volumeBtn.src = 'icons/soundon.svg'
}

// обрабатываем нажание на play/pause
playBtn.addEventListener('click', () => {
    const isPlaying = player.classList.contains('played')
    if (isPlaying) {
        pauseSong()
    } else {
        playSong()
    }
})
// включение выключение звука
volumeBtn.addEventListener('click', () => {
    const isSounded = player.classList.contains('sounded')
    if (isSounded) {
        soundOff()
    } else {
        soundOn()
    }
})

// подготовка песни, вызывается при первом запуске
function preparation() {
    // создаем график обработки звука и анализатор, дающий частоту звуков для аудиовизуализации
    context = new AudioContext()
    analyser = context.createAnalyser()
    // создаем объект из звука
    const src = context.createMediaElementSource(audio)
    // подключаем анализатор
    src.connect(analyser)
    // подключаем устройство вывода
    analyser.connect(context.destination)
    loop()
}

// обновление анимации на каждом перерисовывании страницы
function loop() {
    if (!audio.paused) {
        window.requestAnimationFrame(loop)
    }
    // смотрим колиечество точек в анализаторе
    const analyser_length  = analyser.frequencyBinCount
    // создаем массив такой длины
    let array = new Uint8Array(analyser_length)
    // копируем частотные данные в созданный массив
    analyser.getByteFrequencyData(array)
    animator(array)
}

// задаем параметры анимации
function animator(array) {
    let newArray = array
    newArray = newArray.slice(0, -200)

    for (let i = 0; i < right_side.length; i++) {
        // получаем ширину экрана
        let screenWidth = window.innerWidth
        // вычитаем ширину блока 'player'
        let currentWidth = screenWidth - 420
        // вычисляем значение высоты для столбика
        let num = newArray[parseInt(newArray.length / right_side.length * i)]

        // устанавливаем ширину в зависимости от экрана
        right_side[right_side.length - (i + 1)].style.width = currentWidth / 2 / right_side.length + 'px'
        left_side[i].style.width = currentWidth / 2 / left_side.length + 'px'

        // анимация столбиков
        right_side[right_side.length - (i + 1)].style.height = num + 'px'
        left_side[i].style.height = num + 'px'
    }
}

// конвертация тайминга в привычный формат
function formatTime(seconds) {
    let m = Math.floor((seconds % 3600) / 60)
    let s = seconds % 60
    if (s <= 9) {
        s = '0' + s
    }
    return [m, s].join(':')
}

// анимация прогресс бара
function updateProgress(event) {
    // получаем длительность аудио и тайминг
    const duration = audio.duration
    const currentTime = audio.currentTime
    // выводим длительность и тайминг
    songDuration.innerHTML = formatTime(parseInt(duration))
    currentSongTime.innerHTML = formatTime(parseInt(currentTime))

    const progressPersent = currentTime / duration * 100
    progress.style.width = progressPersent + '%'
}
audio.addEventListener('timeupdate', updateProgress)

// перемотка
function setProgress(event) {
    // получаем ширину контейнера
    const barWidth = this.clientWidth
    // получаем координаты нажатия
    const clickCoord = event.offsetX
    const duration = audio.duration
    audio.currentTime = clickCoord / barWidth * duration
}
progressBar.addEventListener('click', setProgress)

// автопроигрывание
audio.addEventListener('ended', nextSong)