// Update with your config settings.

module.exports = {

  /* development: {
    client: 'sqlite3',
    connection: {
      filename: './src/database/db.sqlite'
    },
    migrations: {
      directory: './src/database/migrations'
    },
    seeds: {
        directory: './src/database/seeds'
    },
    useNullAsDefault: true,
    debug: true,
  }, */

  test: {
    client: 'sqlite3',
    connection: {
      filename: './src/database/test.sqlite'
    },
    migrations: {
      directory: './src/database/migrations'
    },
    seeds: {
        directory: './src/database/seeds'
    },
    useNullAsDefault: true,
  },

  staging: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user:     'username',
      password: 'password'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: 'postgresql',
    version: '12.2',
    connection: process.env.DATABASE_URL,
    //connection: process.env.DB_URL,
    //searchPath: ['knex', 'public'],
    /* connection: {
      host : '127.0.0.1',
      database: 'dbvaldinei',
      user:     'valdinei',
      password: 'als0304'
    },
    pool: {
      min: 2,
      max: 10
    }, */
    migrations: {
        directory: './src/database/migrations',
        tableName: 'knex_migrations'
      },
      seeds: {
          directory: './src/database/seeds'
      },
      useNullAsDefault: true,
      debug: false,
  }

};
