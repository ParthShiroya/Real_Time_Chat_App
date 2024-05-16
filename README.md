# To start the application

1. install all dependencies first using ```npm run i-modules``` command

2. run the application using ```npm run start``` command


# Notes

For some reason, if the port specified for server is changed in 'index.js' file, change the port also at following locations:
I. server/index.js (at the end)
II. client/vite.config.js (line 11)
III. client/src/App.vue (line 32)