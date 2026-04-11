pipeline {
    agent any

    stages {

        stage('Clone Repo') {
            steps {
                git branch: 'main',
                url: 'https://github.com/YOUR_USERNAME/YOUR_REPO.git'
            }
        }

        stage('Build & Deploy') {
            steps {
                sh 'docker compose down || true'
                sh 'docker compose up -d --build'
            }
        }

    }
}
