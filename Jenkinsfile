pipeline {
    agent any

    environment {
        APP_URL    = "http://16.171.38.169:7100"
        IMAGE_TAG  = "selenium-tests:${BUILD_NUMBER}"
        REPORT_DIR = "selenium-tests/reports"
    }

    stages {

        stage('Clone Repository') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/syedalwazislam/disaster-management'
            }
        }

        stage('Verify App is Running') {
            steps {
                sh '''
                    echo "Checking app is live on port 7100..."
                    for i in $(seq 1 10); do
                        if curl -sf http://16.171.38.169:7100 > /dev/null 2>&1; then
                            echo "App is up!"
                            break
                        fi
                        echo "Attempt $i - waiting 5s..."
                        sleep 5
                    done
                    curl -sf http://16.171.38.169:7100 || (echo "ERROR: App not running on :7100" && exit 1)
                '''
            }
        }

        stage('Build Selenium Test Image') {
            steps {
                sh '''
                    docker build \
                        -f selenium-tests/Dockerfile.selenium \
                        -t ${IMAGE_TAG} \
                        selenium-tests/
                '''
            }
        }

        stage('Run Selenium Tests') {
            steps {
                sh '''
                    mkdir -p ${REPORT_DIR}
                    docker run --rm \
                        --network host \
                        -e APP_URL=${APP_URL} \
                        -e HEADLESS=true \
                        -v $(pwd)/${REPORT_DIR}:/tests/reports \
                        ${IMAGE_TAG} || true
                '''
            }
            post {
                always {
                    junit allowEmptyResults: true,
                          testResults: "${REPORT_DIR}/junit_results.xml"
                    archiveArtifacts artifacts: "${REPORT_DIR}/**",
                                     allowEmptyArchive: true
                }
            }
        }

        stage('Cleanup') {
            steps {
                sh "docker rmi ${IMAGE_TAG} || true"
            }
        }
    }

    post {
        always {
            script {
                // Read the email of whoever made the last git commit
                def committerEmail = sh(
                    script: "git log -1 --pretty=format:'%ae'",
                    returnStdout: true
                ).trim()

                echo "Sending results to: ${committerEmail}"

                def status = currentBuild.currentResult
                def icon   = (status == 'SUCCESS') ? '✅' : '❌'
                def color  = (status == 'SUCCESS') ? '#27ae60' : '#e74c3c'

                emailext(
                    to: "${committerEmail}",
                    subject: "${icon} CompassionConnect Tests — ${status} (Build #${BUILD_NUMBER})",
                    mimeType: 'text/html',
                    body: """
                        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">
                            <div style="background:${color};padding:20px;border-radius:8px 8px 0 0;">
                                <h2 style="color:#fff;margin:0;">${icon} Build #${BUILD_NUMBER} — ${status}</h2>
                            </div>
                            <div style="background:#f9f9f9;padding:24px;border:1px solid #ddd;border-radius:0 0 8px 8px;">
                                <table style="width:100%;border-collapse:collapse;font-size:14px;">
                                    <tr style="background:#eee;">
                                        <td style="padding:8px;font-weight:bold;">Project</td>
                                        <td style="padding:8px;">${JOB_NAME}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding:8px;font-weight:bold;">Build</td>
                                        <td style="padding:8px;">#${BUILD_NUMBER}</td>
                                    </tr>
                                    <tr style="background:#eee;">
                                        <td style="padding:8px;font-weight:bold;">Status</td>
                                        <td style="padding:8px;color:${color};font-weight:bold;">${status}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding:8px;font-weight:bold;">Duration</td>
                                        <td style="padding:8px;">${currentBuild.durationString}</td>
                                    </tr>
                                    <tr style="background:#eee;">
                                        <td style="padding:8px;font-weight:bold;">Triggered by</td>
                                        <td style="padding:8px;">${committerEmail}</td>
                                    </tr>
                                </table>
                                <div style="margin-top:20px;">
                                    <a href="${BUILD_URL}artifact/${REPORT_DIR}/test_report.html"
                                       style="padding:10px 18px;background:#2980b9;color:#fff;
                                              text-decoration:none;border-radius:5px;margin-right:10px;">
                                        Download Test Report
                                    </a>
                                    <a href="${BUILD_URL}"
                                       style="padding:10px 18px;background:${color};color:#fff;
                                              text-decoration:none;border-radius:5px;">
                                        View in Jenkins
                                    </a>
                                </div>
                            </div>
                        </div>
                    """,
                    attachmentsPattern: "${REPORT_DIR}/test_report.html"
                )
            }
        }
        success { echo "Pipeline completed successfully." }
        failure { echo "Pipeline failed — check console output." }
    }
}