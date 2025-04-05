# 1. Naudojam oficialų Node įvaizdį
FROM node:20

# 2. Dirbam konteinerio /app kataloge
WORKDIR /app

# 3. Kopijuojam tik priklausomybių failus
COPY package*.json ./

# 4. Įdiegiam visas priklausomybes
RUN npm install

# 5. Kopijuojam visą kodą
COPY . .

# 6. Paleidžiam serverį su ts-node
CMD ["npm", "start"]
