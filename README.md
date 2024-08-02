# Full-Stack-Recipe-Management-System

This is full stack project is built with following technologies

## Frontend
The frontend is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).
You can find this in the folder labelled `frontend`.
It is also hosted on vercel you can see instructions in a README.md file in the frontend folder.
Component test where conducting using Jest and React Testing Library.
The project can be seen here: https://full-stack-recipe-management-system.vercel.app/


## Backend
- Database: The backend was built with `redis` as a caching system and `mongodb` as the real database on the cloud.
- Server: `Express.js` and `Node.js` Javascript runtime
- Documentation: `Swagger` at (https://application-qip5.onrender.com/api-docs/#/)
- Test: Unit Tests written with jest and supertest
- Images: Saved on aws s3 Bucket and connected to the backend server correctly 

## Deployment 
- Configuration: The app was deployed on render.com using a `render.yaml` file for configuration.
- Frontend: was deployed on Vercel, and can be seen here: https://full-stack-recipe-management-system.vercel.app/
- Backend:  was deployed on render.com and can be seen here: https://application-qip5.onrender.com/

## Note: The backend server goes sleep after not been used for a while, so you need to wait a few minutes for the app to do a cold start, after which you can view as you want.