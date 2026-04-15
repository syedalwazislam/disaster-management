pipeline {
  agent any

  // In the Jenkins job UI, enable: "GitHub hook trigger for GITScm polling"
  // and add the GitHub webhook pointing at your Jenkins instance.

  environment {
    COMPOSE_FILE = 'docker-compose.part2.yml'
    COMPOSE_PROJECT_NAME = 'disaster_part2'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build in Node container') {
      agent {
        docker {
          image 'node:20-bookworm'
          args '-u root:root -v npm_cache:/root/.npm'
          reuseNode true
        }
      }
      steps {
        sh 'npm ci'
        sh 'npm run build'
      }
    }

    stage('Bring up Part II stack') {
      steps {
        sh 'docker compose -f docker-compose.part2.yml -p disaster_part2 down || true'
        sh 'docker compose -f docker-compose.part2.yml -p disaster_part2 up -d'
      }
    }
  }
}
