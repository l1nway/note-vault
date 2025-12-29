import i18n from 'i18next'
import {initReactI18next} from 'react-i18next'

const resources = {
  ru: {
    translation: {
      'welcome back': 'добро пожаловать, снова',
      'sign in to access your notes': 'выполните авторизацию, чтобы получить доступ к своим записям',
      'password': 'пароль',
      'remember me': 'запомнить меня',
      'forgot password': 'забыли пароль',
      'login or password is incorrect': 'логин или пароль неверны',
      'sign in': 'войти',
      'or continue with': 'или продолжить с',
      'sign with Google': 'авторизоваться с Google',
      'sign with Apple': 'авторизоваться с Apple',
      "don't have an account": 'ещё нету аккаунта',
      'sign up': 'зарегистрироваться',

      'All notes': 'Все заметки',
      'categories': 'категории',
      'category': 'категория',
      'tag': 'тег',
      'tags': 'теги',
      'archived': 'архивированое',
      'trash': 'удалённое',
      'Not authorized': 'Не авторизован',
      'Name unsaved': 'Не сохранено',
      'Name saved': 'Сохранено',
      'save': 'сохранить',
      'Password must be at least 8 characters long': 'Пароль должен иметь как минимум 8 символов',
      'Password must not contain spaces': 'Пароль не должен содержать пробелов',
      'Password must not match your email address': 'Пароль не должен совпадать с вашей электронной почтой',

      'Account created': 'Аккаунт зарегистрирован',
      'Note name': 'Название заметки',
      'Note title': 'Название заметки',
      'New note': 'Новая заметка',
      'No category': 'Категория не выбрана',
      'Search in all notes…': 'Поиск во всех заметках…',
      'All categories': 'Все категории',
      'work': 'работа',
      'personal': 'персонал',
      'ideas': 'идеи',
      'learning': 'обучение',
      'project': 'проект',
      'All tags': 'Все тэги',
      'Email unsaved': 'Электронная почта не сохранена',
      'Email editing is not yet available': 'Изменение электронной почты пока недоступно',
      'e.g. work, personal, ideas': 'Например, работа, личные дела, идеи',
      'e.g. urgent, ideas, review': 'Например, срочно, идеи, обзор',
      'Create a shareable link to allow others to view this note': 'Создайте общедоступную ссылку, которая открыта другим для просмотра этой заметки',
      'Link duration': 'Время действия ссылки',
      'Сreate share link': 'Создать общедоступную ссылку',
      'Duration not selected': 'Продолжительность не выбрана',
      'No expiration': 'Без истечения',
      'Share note': 'Поделится заметкой',

      'New category': 'Новая категория',
      'New tag': 'Новый тег',

      'profile': 'профиль',
      'the file is not an image': 'файл не является изображением',
      'click to change avatar': 'нажмите чтобы сменить аватарку',
      'The image can only be square. If your image has a different aspect ratio, you can move it to fit the desired image into the square.': 'Изображение может быть только квадратным. Если ваше изображение имеет другое соотношение сторон, вы можете переместить его, чтобы подогнать под размер квадрата.',
      'You can no longer rotate the image to the left.': 'Вы больше не можете вращать изображение влево',
      'You can no longer rotate the image to the right.': 'Вы больше не можете вращать изображение вправо',
      'zoom': 'масштабирование',
      'rotate': 'вращение',
      'Username': 'Имя пользователя',
      'E-Mail': 'Электронная почта',
      'Save changes': 'Сохранить изменения',
      'cancel': 'отменить',
      "Isn't verifed yet": 'Электронная почта не верифицирована',
      'Verify email': 'Верифицировать электронную почту',
      'Verification link has been sent to your email address': 'Ссылка для верификации электронной почты была отправлена на ващ ящик',
      'Account settings': 'Настройки аккаунта',
      'Change language': 'Поменять язык',
      'Change password': 'Поменять пароль',
      'Connected accounts': 'Подключённые аккаунты',
      'Log-out': 'Выйти из аккаунта',
      'Confirm logout': 'Подтвердить выход с аккаунта',
      'Delete account': 'Удалить аккаунт',
      'Changed successfully': 'Успешно изменено',
      'russian': 'русский',
      'ukrainian': 'украинский',
      'polish': 'польский',
      'english': 'английский',
      'Current password': 'Текущий пароль',
      'Enter your current password': 'Введите свой текущий пароль',
      'Entered password is incorrect': 'Пароль введено неверно',
      'New password': 'Новый пароль',
      'Enter your new password': 'Введите новый пароль',
      'Confirm new password': 'Подтвердите новый пароль',
      'Enter the new password again': 'Введите новый пароль снова',
      "Passwords don't match": 'Пароли не совпадают',
      'remove': 'убрать',
      'add': 'добавить',
      'switch': 'изменить',
      'edit': 'редактировать',

      'Delete note': 'Удалить заметку',
      'Are you sure you want to delete this note?': 'Вы уверены, что хотите удалить эту заметку?',
      'delete': 'удалить',

      'Archive note': 'Архивировать заметку',
      'Are you sure you want to archive this note?': 'Вы уверены, что хотите архивировать эту заметку?',
      'archive': 'архивировать',

      'Unarchive note': 'Разархивировать заметку',
      'Are you sure want to unarchive this note?': 'Вы уверены, что хотите разархивировать эту заметку?',
      'unarchive': 'разархивировать',

      'Permanently delete note': 'Удалить заметку навсегда',
      'Are you sure want to permanently delete this note? This action cannot be undone.':
        'Вы уверены, что хотите удалить эту заметку навсегда? Это действие нельзя отменить.',

      'Restore note': 'Восстановить заметку',
      'Are you sure want to restore this note?': 'Вы уверены, что хотите восстановить эту заметку?',
      'restore': 'восстановить',

      'Category name': 'Название категории',
      'Edit category': 'Редактировать категорию',
      'Delete category': 'Удалить категорию',
      'Are you sure you want to delete this category? This action cannot be undone.':
        'Вы уверены, что хотите удалить эту категорию? Это действие нельзя отменить.',

      'Tag name': 'Название тега',
      'Edit tag': 'Редактировать тег',
      'Delete tag': 'Удалить тег',
      'Are you sure you want to delete this tag? This action cannot be undone.':
        'Вы уверены, что хотите удалить этот тег? Это действие нельзя отменить.'
    }
  },

  ua: {
    translation: {
      'welcome back': 'Ласкаво просимо знову',
      'sign in to access your notes': 'Увійдіть, щоб отримати доступ до своїх нотаток',
      'password': 'пароль',
      'remember me': 'запам’ятати мене',
      'forgot password': 'забули пароль',
      'login or password is incorrect': 'логін або пароль невірні',
      'sign in': 'увійти',
      'or continue with': 'або продовжити з',
      'sign with Google': 'увійти через Google',
      'sign with Apple': 'увійти через Apple',
      "don't have an account": 'ще немає акаунта',
      'sign up': 'зареєструватися',

      'All notes': 'Усі нотатки',
      'categories': 'категорії',
      'category': 'категорія',
      'tag': 'тег',
      'tags': 'теги',
      'archived': 'архівоване',
      'trash': 'видалене',
      'Not authorized': 'Не авторизований',

      'Account created': 'Акаунт створено',
      'Note name': 'Назва нотатки',
      'Note title': 'Назва нотатки',
      'New note': 'Нова нотатка',
      'No category': 'Категорія не вибрана',
      'Search in all notes…': 'Пошук у всіх нотатках…',
      'All categories': 'Усі категорії',
      'work': 'робота',
      'personal': 'особисте',
      'ideas': 'ідеї',
      'learning': 'навчання',
      'project': 'проект',
      'All tags': 'Усі теги',

      'New category': 'Нова категорія',
      'New tag': 'Новий тег',

      'profile': 'профіль',
      'the file is not an image': 'файл не є зображенням',
      'click to change avatar': 'натисніть, щоб змінити аватарку',
      'Username': 'Ім’я користувача',
      'email': 'Електронна пошта',
      'Save changes': 'Зберегти зміни',
      'cancel': 'скасувати',
      "Isn't verifed yet": 'Електронна пошта не верифікована',
      'Verify email': 'Верифікувати електронну пошту',
      'Verification link has been sent to your email address': 'Посилання для верифікації надіслано на вашу електронну пошту',
      'Account settings': 'Налаштування акаунта',
      'Change language': 'Змінити мову',
      'Change password': 'Змінити пароль',
      'Connected accounts': 'Підключені акаунти',
      'Log-out': 'Вийти з акаунта',
      'Confirm logout': 'Підтвердити вихід з акаунта',
      'Delete account': 'Видалити акаунт',
      'Changed successfully': 'Успішно змінено',
      'russian': 'російська',
      'ukrainian': 'українська',
      'polish': 'польська',
      'english': 'англійська',
      'Current password': 'Поточний пароль',
      'Enter your current password': 'Введіть поточний пароль',
      'Entered password is incorrect': 'Пароль введено неправильно',
      'New password': 'Новий пароль',
      'Enter your new password': 'Введіть новий пароль',
      'Confirm new password': 'Підтвердіть новий пароль',
      'Enter the new password again': 'Введіть новий пароль ще раз',
      "Passwords don't match": 'Паролі не співпадають',
      'remove': 'видалити',
      'add': 'додати',
      'switch': 'змінити',

      'Delete note': 'Видалити нотатку',
      'Are you sure you want to delete this note?': 'Ви впевнені, що хочете видалити цю нотатку?',
      'delete': 'видалити',

      'Archive note': 'Архівувати нотатку',
      'Are you sure you want to archive this note?': 'Ви впевнені, що хочете архівувати цю нотатку?',
      'archive': 'архівувати',

      'Unarchive note': 'Розархівувати нотатку',
      'Are you sure want to unarchive this note?': 'Ви впевнені, що хочете розархівувати цю нотатку?',
      'unarchive': 'розархівувати',

      'Permanently delete note': 'Видалити нотатку назавжди',
      'Are you sure want to permanently delete this note? This action cannot be undone.':
        'Ви впевнені, що хочете видалити цю нотатку назавжди? Цю дію неможливо скасувати.',

      'Restore note': 'Відновити нотатку',
      'Are you sure want to restore this note?': 'Ви впевнені, що хочете відновити цю нотатку?',
      'restore': 'відновити',

      'Category name': 'Назва категорії',
      'Edit category': 'Редагувати категорію',
      'Delete category': 'Видалити категорію',
      'Are you sure you want to delete this category? This action cannot be undone.':
        'Ви впевнені, що хочете видалити цю категорію? Цю дію неможливо скасувати.',

      'Tag name': 'Назва тегу',
      'Edit tag': 'Редагувати тег',
      'Delete tag': 'Видалити тег',
      'Are you sure you want to delete this tag? This action cannot be undone.':
        'Ви впевнені, що хочете видалити цей тег? Цю дію неможливо скасувати.',

        'Name unsaved': 'Не збережено',
        'Name saved': 'Збережено',
        'save': 'зберегти',

        'Password must be at least 8 characters long':
          'Пароль повинен містити щонайменше 8 символів',
        'Password must not contain spaces':
          'Пароль не повинен містити пробілів',
        'Password must not match your email address':
          'Пароль не повинен співпадати з вашою електронною поштою',

        'Email unsaved': 'Електронна пошта не збережена',
        'Email editing is not yet available':
          'Редагування електронної пошти поки недоступне',

        'e.g. work, personal, ideas':
          'Наприклад: робота, особисте, ідеї',
        'e.g. urgent, ideas, review':
          'Наприклад: терміново, ідеї, огляд',

        'Create a shareable link to allow others to view this note':
          'Створіть загальнодоступне посилання, щоб інші могли переглядати цю нотатку',
        'Link duration': 'Тривалість дії посилання',
        'Сreate share link': 'Створити загальнодоступне посилання',
        'Duration not selected': 'Тривалість не вибрана',
        'No expiration': 'Без обмеження',
        'Share note': 'Поділитися нотаткою',

        'remove': 'прибрати',
        'edit': 'редагувати',

        'You can no longer rotate the image to the left.':
          'Ви більше не можете обертати зображення вліво',
        'You can no longer rotate the image to the right.':
          'Ви більше не можете обертати зображення вправо',
        'zoom': 'масштаб',
        'rotate': 'обертання'
    }
  },

  pl: {
    translation: {
      'welcome back': 'Witaj ponownie',
      'sign in to access your notes': 'Zaloguj się, aby uzyskać dostęp do swoich notatek',
      'password': 'hasło',
      'remember me': 'zapamiętaj mnie',
      'forgot password': 'zapomniałeś hasła',
      'login or password is incorrect': 'login lub hasło są niepoprawne',
      'sign in': 'zaloguj się',
      'or continue with': 'lub kontynuuj z',
      'sign with Google': 'zaloguj się przez Google',
      'sign with Apple': 'zaloguj się przez Apple',
      "don't have an account": 'nie masz konta',
      'sign up': 'zarejestruj się',

      'All notes': 'Wszystkie notatki',
      'categories': 'kategorie',
      'category': 'kategoria',
      'tag': 'tag',
      'tags': 'tagi',
      'archived': 'zarchiwizowane',
      'trash': 'usunęte',
      'Not authorized': 'Nieautoryzowany',

      'Account created': 'Konto utworzone',
      'Note name': 'Nazwa notatki',
      'Note title': 'Nazwa notatki',
      'New note': 'Nowa notatka',
      'No category': 'Brak kategorii',
      'Search in all notes…': 'Szukaj we wszystkich notatkach…',
      'All categories': 'Wszystkie kategorie',
      'work': 'praca',
      'personal': 'osobiste',
      'ideas': 'pomysły',
      'learning': 'nauka',
      'project': 'projekt',
      'All tags': 'Wszystkie tagi',

      'New category': 'Nowa kategoria',
      'New tag': 'Nowy tag',

      'profile': 'profil',
      'the file is not an image': 'plik nie jest obrazem',
      'click to change avatar': 'kliknij, aby zmienić awatar',
      'Username': 'Nazwa użytkownika',
      'email': 'E-mail',
      'Save changes': 'Zapisz zmiany',
      'cancel': 'anuluj',
      "Isn't verifed yet": 'E-mail nie został zweryfikowany',
      'Verify email': 'Zweryfikuj e-mail',
      'Verification link has been sent to your email address': 'Link weryfikacyjny został wysłany na Twój e-mail',
      'Account settings': 'Ustawienia konta',
      'Change language': 'Zmień język',
      'Change password': 'Zmień hasło',
      'Connected accounts': 'Podłączone konta',
      'Log-out': 'Wyloguj się',
      'Confirm logout': 'Potwierdź wylogowanie',
      'Delete account': 'Usuń konto',
      'Changed successfully': 'Pomyślnie zmieniono',
      'russian': 'rosyjski',
      'ukrainian': 'ukraiński',
      'polish': 'polski',
      'english': 'angielski',
      'Current password': 'Aktualne hasło',
      'Enter your current password': 'Wpisz swoje aktualne hasło',
      'Entered password is incorrect': 'Wpisane hasło jest niepoprawne',
      'New password': 'Nowe hasło',
      'Enter your new password': 'Wpisz nowe hasło',
      'Confirm new password': 'Potwierdź nowe hasło',
      'Enter the new password again': 'Wpisz ponownie nowe hasło',
      "Passwords don't match": 'Hasła nie są zgodne',
      'remove': 'usuń',
      'add': 'dodaj',
      'switch': 'zmień',

      'Delete note': 'Usuń notatkę',
      'Are you sure you want to delete this note?': 'Czy na pewno chcesz usunąć tę notatkę?',
      'delete': 'usuń',

      'Archive note': 'Archiwizuj notatkę',
      'Are you sure you want to archive this note?': 'Czy na pewno chcesz zarchiwizować tę notatkę?',
      'archive': 'archiwizuj',

      'Unarchive note': 'Przywróć z archiwum',
      'Are you sure want to unarchive this note?': 'Czy na pewno chcesz przywrócić tę notatkę z archiwum?',
      'unarchive': 'przywróć',

      'Permanently delete note': 'Usuń notatkę na stałe',
      'Are you sure want to permanently delete this note? This action cannot be undone.':
        'Czy na pewno chcesz trwale usunąć tę notatkę? Tej operacji nie można cofnąć.',

      'Restore note': 'Przywróć notatkę',
      'Are you sure want to restore this note?': 'Czy na pewno chcesz przywrócić tę notatkę?',
      'restore': 'przywróć',

      'Category name': 'Nazwa kategorii',
      'Edit category': 'Edytuj kategorię',
      'Delete category': 'Usuń kategorię',
      'Are you sure you want to delete this category? This action cannot be undone.':
        'Czy na pewno chcesz usunąć tę kategorię? Tej operacji nie można cofnąć.',

      'Tag name': 'Nazwa tagu',
      'Edit tag': 'Edytuj tag',
      'Delete tag': 'Usuń tag',
      'Are you sure you want to delete this tag? This action cannot be undone.':
        'Czy na pewno chcesz usunąć ten tag? Tej operacji nie można cofnąć.',

        'Name unsaved': 'Nie zapisano',
        'Name saved': 'Zapisano',
        'save': 'zapisz',

        'Password must be at least 8 characters long':
          'Hasło musi mieć co najmniej 8 znaków',
        'Password must not contain spaces':
          'Hasło nie może zawierać spacji',
        'Password must not match your email address':
          'Hasło nie może być takie samo jak adres e-mail',

        'Email unsaved': 'Adres e-mail nie został zapisany',
        'Email editing is not yet available':
          'Edycja adresu e-mail nie jest jeszcze dostępna',

        'e.g. work, personal, ideas':
          'Na przykład: praca, osobiste, pomysły',
        'e.g. urgent, ideas, review':
          'Na przykład: pilne, pomysły, przegląd',

        'Create a shareable link to allow others to view this note':
          'Utwórz link udostępniania, aby inni mogli przeglądać tę notatkę',
        'Link duration': 'Czas trwania linku',
        'Сreate share link': 'Utwórz link udostępniania',
        'Duration not selected': 'Czas trwania nie został wybrany',
        'No expiration': 'Bez wygaśnięcia',
        'Share note': 'Udostępnij notatkę',

        'remove': 'usuń',
        'edit': 'edytuj',

        'You can no longer rotate the image to the left.':
          'Nie możesz już obracać obrazu w lewo',
        'You can no longer rotate the image to the right.':
          'Nie możesz już obracać obrazu w prawo',
        'zoom': 'powiększenie',
        'rotate': 'obrót'
    }
  }
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('lang') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  })

export default i18n