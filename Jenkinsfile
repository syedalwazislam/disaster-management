pipeline {
    agent any

    stages {

        stage('Clone Repository') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/syedalwazislam/disaster-management'
            }
        }

        stage('Stop Old Containers') {
            steps {
                sh 'docker-compose down || true'
            }
        }

        stage('Build & Run Containers') {
            steps {
                sh 'docker-compose up -d --build'
            }
        }

        stage('Check Running Containers') {
            steps {
                sh 'docker ps'
            }
        }
    }

    post {
        success {
            echo "Pipeline executed successfully 🚀"
        }
        failure {
            echo "Pipeline failed ❌"
        }
    }
}
