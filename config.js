module.exports = {
    'secret': 'a003_image_processing_team',
    'host': 'localhost',
    'port': 9013,
    "routes": [       
        {
            url: 'user',
            file: 'user'
        },
        {
            url: 'menu',
            file: 'menu'
        },
        {
            url: 'upload',
            file: 'upload'
        },
        {
            url: 'images',
            file: 'images'
        },
        {
            url: 'detect',
            file: 'detect'
        },
        {
            url: 'album',
            file: 'album'
        },
        {
            url: 'subscriptions',
            file: 'subscriptions'
        },
        {
            url: 'person',
            file: 'person'
        }

    ],
    "database": {
        connectionLimit: 100,
        host: '172.16.0.68',
        user: 'dev',
        password: 'dev123',
        database: 'a003_image_processing',
        debug: false
    },
    "servermail": {
            service: 'gmail',
            auth: {
                user: 'nguyenkhacvan113@gmail.com', // Your email id
                pass: '123456zxqy' // Your password
            }
        },
    "errormail":'xuan@rasia.info',
    "mashapekey": 'k2KXTe8BJjmsh17FZ9rMIwKVtEatp1vEsZdjsnqpn2sflYqZwd'

};
