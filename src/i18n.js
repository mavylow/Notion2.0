"use client";
import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

i18next
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    supportedLngs: ["en", "ru", "it"],
    fallbackLng: "en",
    debug: true,
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {
        translation: {
          signIn: "Sign In",
          toSignIn: "sign in",
          signUp: "Sign Up",
          toSignUp: "sign up",
          signIntoAccount: "Sign in into an account",
          createAccount: "Create an account",

          email: "Email",
          emailPlaceholder: "Enter email",
          changeEmail: "Change email",
          password: "Password",
          passwordPlaceholder: "Enter password",

          enterFields:
            "Enter your email and password to {{sign}} into this app",

          emailNotValid: "Email is not valid",
          shortPassword: "Password must be at least 8 characters",
          longPassword: "Password cannot exceed 14 characters",
          passwordContainNumber: "Password must contain at least one number",
          strongPassword: "Your password is strong",

          dontHaveAccount: "Don't have an account?",
          alreadyHaveAccount: "Already have an account?",
          forgotToCreate: "Forgot to create an account?",

          termsAgreement: "By clicking continue, you agree to our",
          termsOfService: "Terms of Service",
          and: "and",
          privacyPolicy: "Privacy Policy",

          whatHappening: "What’s happening?",
          tellEveryone: "Tell everyone",

          likes: "Likes",
          like_one: "{{count}} like",
          like_other: "{{count}} likes",
          like_zero: "no likes",

          comments: "Comments",
          comment_one: "{{count}} comment",
          comment_other: "{{count}} comments",
          comment_zero: "no comments",
          hiddenComments: "You have to login to see the comments",
          addAComment: "Add a comment",
          addCommentPlaceholder: "Write description here...",

          posts: "posts",

          time: {
            now: "now",
            minute: "{{count}}m ago",
            hour: "{{count}}h ago",
            day: "{{count}}d ago",
            week: "{{count}}w ago",
            month: "{{count}}mth ago",
            fullDate: "{{date}}",
          },

          months: {
            jan: "Jan",
            feb: "Feb",
            mar: "Mar",
            apr: "Apr",
            may: "May",
            jun: "Jun",
            jul: "Jul",
            aug: "Aug",
            sep: "Sep",
            oct: "Oct",
            nov: "Nov",
            dec: "Dec",
          },

          monthStat: "month over month",
          switchStatTables: "Switch to table view",
          switchStatCharts: "Switch to charts view",

          createPost: "Create a new post",
          postTitle: "Post title",
          postTitlePlaceholder: "Enter post title",
          description: "Description",
          descriptionPlaceholder: "Write description here...",
          selectFile: "Select a file or drag and drop here",
          imagePlaceholderLong: "JPG, PNG or PDF, file size no more than 10MB",
          imagePlaceholderShort: "JPG, PNG, no more than 10MB",
          imageMaxSize: "Max allowed size is 10MB",
          create: "Create",

          titleRequired: "Title is required",
          max20chars: "Max 20 characters",
          max200chars: "Max 200 characters",
          usernameTooLong: "Username is too long",
          wrongFileFormat: "Unsupported file format. Please upload JPG, PNG",

          preferences: "Preferences",
          actions: "Actions",
          logout: "Logout",
          editProfile: "Edit profile",
          changeProfilePhoto: "Change profile photo",
          username: "Username",
          usernamePlaceholder: "Enter your username",
          saveChanges: "Save changes",
          profileInfo: "Profile Info",
          statistics: "Statistics",

          theme: {
            dark: "Dark theme",
            light: "Light theme",
          },

          updateProfileStatus: {
            success: "Profile info updated successfully",
            error: "Error while updating",
          },

          signInStatus: {
            success: "Signed in successfully",
            error: "Authentication failed",
            fetchError: "Data fetching error",
          },

          signUpStatus: {
            success: "Signup in successfully",
            error: "Signup failed",
          },

          restoreAuthStatus: {
            success: "Welcome back!",
            warning: "Session expired",
            error: "Authentication failed",
          },

          logOutStatus: {
            success: "Logged out successfully",
          },

          english: "English",
          russian: "Russian",
          italian: "Italian",
          createDesk: "Create Desk",
          deskName: "Desk Name",
          deskNamePlaceholder: "Enter desk name...",
          deskLink: "Desk Link (optional)",
          deskLinkPlaceholder: "Enter desk link...",

          desks: "Desks",
          permission: "Permission",
          anyoneWithLink: "Anyone with the link",
          permissionDenied: "Permission denied",
        },
      },

      ru: {
        translation: {
          signUp: "Регистрация",
          toSignUp: "зарегистрироваться",
          signIn: "Вход",
          toSignIn: "войти",
          signIntoAccount: "Войти в аккаунт",
          createAccount: "Создать аккаунт",

          email: "Электронная почта",
          emailPlaceholder: "Введите почту",
          changeEmail: "Изменить почту",
          password: "Пароль",
          passwordPlaceholder: "Введите пароль",

          enterFields:
            "Введите вашу почту и пароль, чтобы {{sign}} в это приложение",

          emailNotValid: "Email некорректный",
          shortPassword: "Пароль должен содержать минимум 8 символов",
          longPassword: "Пароль не может превышать 14 символов",
          passwordContainNumber: "Пароль должен содержать хотя бы одну цифру",
          strongPassword: "Ваш пароль надежный",

          dontHaveAccount: "Нет аккаунта?",
          alreadyHaveAccount: "Уже есть аккаунт?",
          forgotToCreate: "Забыли создать аккаунт?",

          termsAgreement: "Нажимая продолжить, вы соглашаетесь с",
          termsOfService: "Условиями использования",
          and: "и",
          privacyPolicy: "Политикой конфиденциальности",

          whatHappening: "Что происходит?",
          tellEveryone: "Расскажите всем",

          likes: "Лайки",
          like_one: "{{count}} лайк",
          like_few: "{{count}} лайка",
          like_many: "{{count}} лайков",
          like_zero: "нет лайков",

          comments: "Комментарии",
          comment_one: "{{count}} комментарий",
          comment_few: "{{count}} комментария",
          comment_many: "{{count}} комментариев",
          comment_zero: "нет комментариев",
          hiddenComments: "Войдите, чтобы видеть комментарии",
          addAComment: "Добавить комментарий",
          addCommentPlaceholder: "Напишите описание здесь...",

          posts: "посты",

          time: {
            now: "только что",
            minute: "{{count}} мин назад",
            hour: "{{count}} ч назад",
            day: "{{count}} д назад",
            week: "{{count}} нед назад",
            month: "{{count}} мес назад",
            fullDate: "{{date}}",
          },

          months: {
            jan: "Янв",
            feb: "Фев",
            mar: "Мар",
            apr: "Апр",
            may: "Май",
            jun: "Июн",
            jul: "Июл",
            aug: "Авг",
            sep: "Сен",
            oct: "Окт",
            nov: "Ноя",
            dec: "Дек",
          },

          monthStat: "месяц к месяцу",
          switchStatTables: "Переключить на таблицы",
          switchStatCharts: "Переключить на графики",

          createPost: "Создать новый пост",
          postTitle: "Заголовок поста",
          postTitlePlaceholder: "Введите заголовок поста",
          description: "Описание",
          descriptionPlaceholder: "Напишите описание здесь...",
          selectFile: "Выберите файл или перетащите его сюда",
          imagePlaceholderLong: "JPG, PNG или PDF, не более 10 МБ",
          imagePlaceholderShort: "JPG, PNG, не более 10 МБ",

          imageMaxSize: "Максимальный размер файла — 10 МБ",
          create: "Создать",

          titleRequired: "Заголовок обязателен",
          max20chars: "Макс. 20 символов",
          max200chars: "Макс. 200 символов",
          usernameTooLong: "Имя пользователя слишком длинное",
          wrongFileFormat: "Неподдерживаемый формат файла. Загрузите JPG, PNG",

          preferences: "Настройки",
          actions: "Действия",
          logout: "Выйти",
          editProfile: "Редактировать профиль",
          changeProfilePhoto: "Изменить фото профиля",
          username: "Имя пользователя",
          usernamePlaceholder: "Введите имя пользователя",
          saveChanges: "Сохранить изменения",
          profileInfo: "Профиль",
          statistics: "Статистика",

          theme: {
            dark: "Тёмная тема",
            light: "Светлая тема",
          },

          updateProfileStatus: {
            success: "Профиль успешно обновлен",
            error: "Ошибка при обновлении",
          },

          signInStatus: {
            success: "Вы успешно вошли",
            error: "Ошибка входа",
            fetchError: "Данные не найдены",
          },

          signUpStatus: {
            success: "Регистрация прошла успешно",
            error: "Ошибка регистрации",
          },

          restoreAuthStatus: {
            success: "С возвращением!",
            warning: "Сессия истекла",
            error: "Ошибка аутентификации",
          },

          logOutStatus: {
            success: "Вы вышли из системы",
          },
          createDesk: "Создать доску",
          deskName: "Название доски",
          deskNamePlaceholder: "Введите название доски...",
          deskLink: "Ссылка на доску (необязательно)",
          deskLinkPlaceholder: "Введите ссылку на доску...",
          permission: "Доступ",
          anyoneWithLink: "Любой по ссылке",
          permissionDenied: "Доступ запрещен",
          desks: "Доски",
        },
      },

      it: {
        translation: {
          signUp: "Registrati",
          toSignUp: "registrati",
          signIn: "Accedi",
          toSignIn: "accedi",
          signIntoAccount: "Accedi al tuo account",
          createAccount: "Crea un account",

          email: "Email",
          emailPlaceholder: "Inserisci email",
          changeEmail: "Cambia email",
          password: "Password",
          passwordPlaceholder: "Inserisci password",

          enterFields:
            "Inserisci la tua email e password per {{sign}} in questa app",

          emailNotValid: "L'email non è valida",
          shortPassword: "La password deve contenere almeno 8 caratteri",
          longPassword: "La password non può superare i 14 caratteri",
          passwordContainNumber: "La password deve contenere almeno un numero",
          strongPassword: "La tua password è sicura",

          dontHaveAccount: "Non hai un account?",
          alreadyHaveAccount: "Hai già un account?",
          forgotToCreate: "Hai dimenticato di creare un account?",

          termsAgreement: "Cliccando continua, accetti i nostri",
          termsOfService: "Termini di servizio",
          and: "e",
          privacyPolicy: "Informativa sulla privacy",

          whatHappening: "Cosa sta succedendo?",
          tellEveryone: "Dillo a tutti",

          likes: "likes",
          like_one: "{{count}} like",
          like_other: "{{count}} likes",
          like_zero: "nessun like",

          comments: "commenti",
          comment_one: "{{count}} commento",
          comment_other: "{{count}} commenti",
          comment_zero: "nessun commento",
          hiddenComments: "Devi accedere per vedere i commenti",
          addAComment: "Aggiungi un commento",
          addCommentPlaceholder: "Scrivi qui la descrizione...",

          time: {
            now: "ora",
            minute: "{{count}} min fa",
            hour: "{{count}} h fa",
            day: "{{count}} g fa",
            week: "{{count}} sett fa",
            month: "{{count}} mesi fa",
            fullDate: "{{date}}",
          },

          months: {
            jan: "Gen",
            feb: "Feb",
            mar: "Mar",
            apr: "Apr",
            may: "Mag",
            jun: "Giu",
            jul: "Lug",
            aug: "Ago",
            sep: "Set",
            oct: "Ott",
            nov: "Nov",
            dec: "Dic",
          },

          monthStat: "mese su mese",
          switchStatTables: "Passa alla vista tabella",
          switchStatCharts: "Passa alla vista grafici",

          posts: "posts",
          createPost: "Crea un nuovo post",
          postTitle: "Titolo del post",
          postTitlePlaceholder: "Inserisci il titolo del post",
          description: "Descrizione",
          descriptionPlaceholder: "Scrivi qui la descrizione...",
          selectFile: "Seleziona un file o trascinalo qui",
          imagePlaceholderLong: "JPG, PNG o PDF, max 10 MB",
          imagePlaceholderShort: "JPG, PNG, max 10 MB",
          imageMaxSize: "Dimensione massima consentita 10 MB",
          create: "Crea",

          titleRequired: "Il titolo è obbligatorio",
          max20chars: "Max 20 caratteri",
          max200chars: "Max 200 caratteri",
          usernameTooLong: "Nome utente troppo lungo",
          wrongFileFormat: "Formato file non supportato. Carica JPG, PNG",

          preferences: "Preferenze",
          actions: "Azioni",
          logout: "Esci",
          editProfile: "Modifica profilo",
          changeProfilePhoto: "Cambia foto profilo",
          username: "Nome utente",
          usernamePlaceholder: "Inserisci nome utente",
          saveChanges: "Salva modifiche",
          profileInfo: "Info profilo",
          statistics: "Statistiche",

          theme: {
            dark: "Tema scuro",
            light: "Tema chiaro",
          },

          updateProfileStatus: {
            success: "Profilo aggiornato con successo",
            error: "Errore durante l'aggiornamento",
          },

          signInStatus: {
            success: "Accesso effettuato con successo",
            error: "Autenticazione fallita",
            fetchError: "Errore nel recupero dei dati",
          },

          signUpStatus: {
            success: "Registrazione completata con successo",
            error: "Registrazione fallita",
          },

          restoreAuthStatus: {
            success: "Bentornato!",
            warning: "Sessione scaduta",
            error: "Autenticazione fallita",
          },

          logOutStatus: {
            success: "Disconnessione effettuata con successo",
          },

          createDesk: "Crea Scrivia",
          deskName: "Nome della scrivia",
          deskNamePlaceholder: "Inserisci il nome della scrivia...",
          deskLink: "Link della scrivia (opzionale)",
          deskLinkPlaceholder: "Inserisci il link della scrivia...",
        },

        desks: "Desks",
        permission: "Permesso",
        anyoneWithLink: "Chiunque abbia il link",
        permissionDenied: "Permesso negato",
      },
    },
  });

export default i18next;
