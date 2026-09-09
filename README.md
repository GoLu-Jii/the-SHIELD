SPECTRA — Passive Network Threat Detection & Security Analytics

A passive, real-time cybersecurity monitoring platform that analyzes network telemetry using Zeek and machine-learning-based threat detectors.

Overview

SPECTRA is a passive network threat detection and security analytics platform designed for monitoring critical infrastructure and other high-value networks without actively interacting with production traffic.

Instead of placing a security system inline with the production network, SPECTRA receives a read-only copy of network traffic through a passive mirror or one-way monitoring path.

The traffic is processed by Zeek, which converts packets into structured network telemetry. SPECTRA then:

Ingests Zeek telemetry

Normalizes events into a common schema

Routes events to specialized detectors

Builds detector-specific time windows

Extracts machine-learning features

Runs deployed ML models

Applies detection thresholds

Generates standardized security alerts

Exposes alerts through REST APIs and WebSockets

Displays them through a real-time security dashboard

Network Traffic
      |
      v
Passive Mirror / One-Way Feed
      |
      v
     Zeek
      |
      v
Network Telemetry
      |
      v
   Ingestor
      |
      v
Normalized Events
      |
      v
 Orchestrator
      |
      v
Detector-Specific Windows
      |
      v
Feature Extraction
      |
      v
Machine Learning Models
      |
      v
Standardized Alerts
      |
      +----------> REST API
      |
      +----------> WebSocket
                       |
                       v
                 Security Dashboard

Key Features

Passive network monitoring

Read-only monitoring architecture

Zeek-based network telemetry

PCAP-based reproducible testing

Common event normalization

Streaming event processing

Detector-specific time windows

Machine-learning-based detection

Multiple specialized threat detectors

Standardized alert contract

REST API

Real-time WebSocket alert streaming

Real-time security dashboard

Detector failure isolation

Bounded event queues

Subscriber backpressure protection

Malformed telemetry quarantine

Graceful runtime shutdown

Offline replay and evaluation

Docker deployment

Git LFS support for ML artifacts

Runtime health and performance metrics

Threat Detection

Threat

Detection Approach

Runtime Window

DDoS

ML-based traffic anomaly detection

60 sec

C2 Beaconing

Flow/temporal behavior analysis

60 sec

DGA

Suspicious DNS-domain analysis

1 sec

DNS Tunnelling

DNS traffic behavior analysis

60 sec

Malware TLS

Encrypted-session metadata analysis

60 sec

Port Scanning

Source-based connection analysis

1 sec

Exfiltration

Optional ML-based integration

Optional

DDoS Detection

The DDoS detector analyzes network traffic characteristics to identify abnormal traffic patterns associated with denial-of-service attacks.

Runtime:

60-second window

Grouping by destination IP

ML-based classification

Confidence-based alert generation

C2 Beaconing Detection

The C2 detector looks for communication patterns that may indicate command-and-control activity.

Traffic is grouped using:

(src_ip, dst_ip)

The detector can use behavioral and temporal characteristics such as:

Duration

Packet count

Byte count

Inter-arrival time

Inter-arrival variance

Inter-arrival standard deviation

Byte statistics

Protocol information

Reverse-direction traffic

DGA Detection

DGA detection focuses on DNS domains that exhibit characteristics associated with algorithmically generated domain names.

The detector analyzes DNS telemetry and produces a standardized alert when the model identifies suspicious domain behavior.

DNS Tunnelling Detection

The DNS tunnelling detector analyzes DNS traffic for patterns that may indicate data being transmitted through DNS queries.

Runtime characteristics:

60-second windows

Five-tuple grouping

DNS-specific metadata

DNS tunnelling processing requires the corresponding DNS packet metadata to be available.

Malware TLS Detection

The Malware TLS detector analyzes encrypted-session metadata without requiring payload decryption.

It can use characteristics of TLS/SSL sessions and network behavior as signals for detecting potentially malicious encrypted communication.

Runtime characteristics:

60-second windows

Five-tuple grouping

TLS/SSL metadata

Machine-learning inference

TLS metadata or fingerprints such as JA3/JA4 are detection signals. They should not be interpreted by themselves as proof that a session is malicious.

Port Scanning Detection

The port-scan detector identifies reconnaissance behavior based on connection patterns.

Runtime characteristics:

1-second windows

Grouping by source IP

Exfiltration Detection

SPECTRA also supports an optional exfiltration detector integration.

The exfiltration component can analyze network behavior for characteristics associated with potential data-exfiltration activity.

The detector is treated as optional so that unavailable or undeployed exfiltration artifacts do not prevent the core detection pipeline from running.

Architecture

Passive Monitoring Architecture

SPECTRA is designed around a passive monitoring model.

                 PRODUCTION NETWORK
                         |
                         v
                  Network Switch
                         |
                         | Passive Mirror
                         v
              +---------------------+
              | Monitoring Enclave  |
              |     Read-Only       |
              +----------+----------+
                         |
                         v
                       Zeek
                         |
                         v
              Network Metadata
                         |
                         v
                     SPECTRA
                         |
                         v
                  Security Alerts

SPECTRA does not require an active path back into the production network.

It does not:

Inject packets

Modify traffic

Perform active probing

Initiate suspicious connections

Act as an inline firewall

Automatically block network traffic

The system is focused on observation and detection.

Backend Architecture

                  +------------------+
                  |  Zeek Telemetry  |
                  +--------+---------+
                           |
                           v
                  +------------------+
                  |     Ingestor     |
                  | Parse + Normalize|
                  +--------+---------+
                           |
                           v
                  +------------------+
                  | Common Event     |
                  |     Schema       |
                  +--------+---------+
                           |
                           v
                  +------------------+
                  |   Orchestrator   |
                  | Routing/Windows  |
                  +--------+---------+
                           |
            +--------------+--------------+
            |              |              |
            v              v              v
          DDoS             C2            DGA
        Detector         Detector      Detector
            |              |              |
            +--------------+--------------+
                           |
            +--------------+--------------+
            |              |              |
            v              v              v
       DNS Tunnel      Malware TLS    Port Scan
        Detector         Detector      Detector
            |              |              |
            +--------------+--------------+
                           |
                           v
                  +------------------+
                  | Standardized     |
                  |      Alert       |
                  +--------+---------+
                           |
                 +---------+---------+
                 |                   |
                 v                   v
             REST API           WebSocket
                 |                   |
                 +---------+---------+
                           |
                           v
                    Security Dashboard

Detection Pipeline

Every supported event follows a common processing pipeline.

Zeek Event
    |
    v
Parse
    |
    v
Normalize
    |
    v
Common Event Schema
    |
    v
Detector Routing
    |
    v
Detector-Specific Window
    |
    v
Feature Extraction
    |
    v
ML Model
    |
    v
Probability / Score
    |
    v
Threshold
    |
    v
Standardized Alert
    |
    v
Store + API + WebSocket

This design separates network ingestion, streaming orchestration, detector logic, machine-learning inference, and presentation.

Model Adapter Architecture

Different ML models may require different:

Feature sets

Feature ordering

Preprocessing

Input formats

Detection thresholds

SPECTRA keeps model-specific logic inside detector adapters.

              Normalized Event
                     |
                     v
              Detector Adapter
                     |
             +-------+-------+
             |               |
             v               v
       Feature Extraction   Model Input
             |               |
             +-------+-------+
                     |
                     v
                 ML Model
                     |
                     v
                Prediction
                     |
                     v
              Alert Generation

The API and frontend do not need to know how an individual detector's ML model works internally.

Backend Components

backend/ingestor.py

Responsible for:

Reading Zeek logs

Parsing supported telemetry

Converting raw records into normalized events

Validating incoming records

Quarantining malformed or unsupported telemetry

Primary telemetry includes:

conn.log

dns.log

ssl.log

http.log

where applicable.

backend/schemas.py

Defines the common internal event and alert contracts.

backend/windowing.py

Provides detector-specific time-window functionality.

Examples:

DDoS
60 sec
dst_ip

C2
60 sec
src_ip + dst_ip

DGA
1 sec

Port Scan
1 sec
src_ip

backend/orchestrator.py

Responsible for:

Routing events to detectors

Maintaining detector windows

Triggering detector inference

Coordinating detector execution

Isolating detector failures

backend/runner.py

Provides the streaming runtime.

Responsibilities include:

Event ingestion

Bounded queues

Worker execution

Processing metrics

Alert publication

Subscriber management

Graceful shutdown

Replay backpressure

backend/main.py

Provides the FastAPI application and runtime endpoints.

backend/store.py

Provides alert storage used by the runtime and API.

backend/metrics.py

Tracks operational and performance metrics.

API

SPECTRA exposes REST and WebSocket interfaces.

Health

GET /health

Used to determine whether the backend is operational and ready.

Statistics

GET /stats

Returns runtime statistics including:

Events received

Events processed

Dropped events

Detector failures

Queue depth

Alerts generated

Runtime performance

Alerts

GET /alerts

Returns generated security alerts.

Alert Details

GET /alerts/{id}

Returns details for a specific alert.

WebSocket

/ws

The WebSocket provides real-time alert delivery to connected dashboard clients.

Detector
   |
   v
New Alert
   |
   v
Alert Store
   |
   +-------> REST API
   |
   +-------> WebSocket
                  |
                  v
               Dashboard

Standardized Alerts

Detector-specific results are converted into a common alert structure.

A typical alert can contain:

Alert ID
Timestamp
Detector
Threat Type
Severity
Confidence
Source IP
Destination IP
Protocol
Evidence
Status

This allows the frontend and API to consume alerts from all detectors through the same interface.

Streaming Runtime

SPECTRA supports two primary processing modes.

Live Streaming

Live Telemetry
      |
      v
    Runner
      |
      v
Orchestrator
      |
      v
 Detectors

Offline Replay

PCAP
 |
 v
Zeek
 |
 v
Zeek Logs
 |
 v
Replay
 |
 v
Runner
 |
 v
Orchestrator
 |
 v
Detectors

Both paths use the same core processing architecture.

Backpressure

The streaming runtime uses bounded queues to prevent uncontrolled memory growth.

The production event queue is bounded.

For offline replay, the runtime applies backpressure when the processing queue is full rather than unnecessarily dropping events.

Replay Producer
      |
      v
Bounded Queue
      |
      | Queue Full
      v
 Wait for Capacity
      |
      v
Continue Replay

This makes offline evaluation more reliable.

Detector Failure Isolation

A failure in one detector should not terminate the complete monitoring system.

                 Event
                   |
          +--------+--------+
          |        |        |
          v        v        v
        DDoS       C2       DGA
          |        |        |
          v        X        v
        Alert    Failure   Alert
                   |
                   v
            Other detectors
            continue running

Detector failures are recorded through runtime metrics.

Malformed Telemetry

Not every Zeek-generated record is necessarily a valid detector input.

The ingestion layer distinguishes supported telemetry from malformed or unsupported records.

Invalid records can be quarantined instead of terminating the streaming runtime.

This provides:

Fault isolation

Runtime stability

Better observability

Safer handling of unexpected telemetry

Frontend

SPECTRA includes a React-based security dashboard.

The dashboard communicates with the backend through REST and WebSocket interfaces.

React Dashboard
      |
      +-------- REST ---------> FastAPI
      |
      +------ WebSocket ------> FastAPI
                                  |
                                  v
                               SPECTRA

The dashboard can display:

System readiness

Live connection state

Security alerts

Alert severity

Confidence

Detector type

Evidence

Runtime statistics

Processing information

Network flow information

Threat distribution

The frontend does not directly execute ML detector logic.

Technology Stack

Backend

Python

FastAPI

Pydantic/data schemas

Async processing

WebSockets

Scikit-learn

XGBoost

Detector-specific ML integrations

Network Analysis

Zeek

PCAP

Network flow metadata

DNS metadata

TLS/SSL metadata

Frontend

React

Vite

JavaScript/TypeScript ecosystem

Deployment

Docker

Docker Compose

Version Control

Git

Git LFS

Repository Structure

the-SHIELD/
|
+-- backend/
|   +-- main.py
|   +-- runner.py
|   +-- ingestor.py
|   +-- orchestrator.py
|   +-- windowing.py
|   +-- schemas.py
|   +-- store.py
|   +-- metrics.py
|   +-- dns_tunnelling_pcap.py
|   +-- evaluate_replay.py
|   +-- evaluation.py
|   +-- exfiltration_features.py
|   +-- exfiltration_pcap.py
|   +-- malware_tls_features.py
|   +-- test_*.py
|
+-- ml_engine/
|   +-- C2 Beaconing/
|   +-- P2-B — DGA DNS TUNNELLING/
|   +-- ddos/
|   +-- malware_tls/
|   +-- port_scanning/
|   +-- exfilteration/
|
+-- frontend/
|
+-- data_and_demo/
|
+-- docs/
|   +-- deployment.md
|
+-- demo_live_replay.py
+-- Dockerfile
+-- docker-compose.yml
+-- .dockerignore
+-- .gitattributes
+-- .gitignore
+-- README.md

Installation

Prerequisites

Install:

Python 3.x

Git

Git LFS

Docker Desktop

Node.js

npm

Zeek, locally or through Docker

Clone

git clone https://github.com/GoLu-Jii/the-SHIELD.git
cd the-SHIELD

Initialize Git LFS:

git lfs install
git lfs pull

Python Setup

Create a virtual environment:

Windows

python -m venv .venv

Activate:

.\.venv\Scripts\Activate.ps1

Install dependencies:

pip install -r backend/requirements.txt

Run Backend

From the project root:

uvicorn backend.main:app --host 127.0.0.1 --port 8000

The backend will be available at:

http://127.0.0.1:8000

Run Frontend

Open another terminal:

cd frontend

Install dependencies:

npm install

Start the development server:

npm run dev -- --host 127.0.0.1

Open the URL displayed by Vite.

Docker Deployment

Build and start:

docker compose up --build

Run in the background:

docker compose up --build -d

Check services:

docker compose ps

View logs:

docker compose logs -f

Stop:

docker compose down

Zeek PCAP Processing

SPECTRA can process PCAP files through Zeek.

Example:

data_and_demo/
└── pcap/
    └── sample.pcap

Using Docker:

docker run --rm `
  -w /output `
  -v "${PWD}\data_and_demo\pcap:/pcap:ro" `
  -v "${PWD}\data_and_demo\zeek:/output" `
  zeek/zeek:lts `
  zeek -r /pcap/sample.pcap

This generates Zeek telemetry such as:

conn.log
dns.log
ssl.log

The resulting logs can be replayed through SPECTRA.

Evaluation

SPECTRA contains an evaluation/replay harness.

Example:

python -m backend.evaluate_replay --zeek-dir data_and_demo\zeek

The evaluation system measures:

Events received

Events processed

Dropped events

Detector failures

Alerts generated

Detector-specific alert counts

Processing throughput

Inference latency

End-to-end latency

Queue behavior

Live Replay Demo

The project includes:

demo_live_replay.py

Example:

$env:SUBSCRIBER_QUEUE_MAX_SIZE="2000"

python demo_live_replay.py `
  --host 127.0.0.1 `
  --port 8000 `
  --zeek-dir data_and_demo\zeek

The frontend can then connect to the backend and receive alerts in real time.

End-to-End Demo

The recommended demonstration flow is:

1. Start Docker
        |
        v
2. Process PCAP with Zeek
        |
        v
3. Generate Zeek logs
        |
        v
4. Start SPECTRA backend
        |
        v
5. Start frontend
        |
        v
6. Replay telemetry
        |
        v
7. Normalize events
        |
        v
8. Run detector windows
        |
        v
9. Execute ML models
        |
        v
10. Generate alerts
        |
        v
11. Stream alerts through WebSocket
        |
        v
12. Display alerts on dashboard

Testing

The backend contains unit, integration, runtime, and evaluation tests.

Examples:

backend/test_api_contract.py
backend/test_c2_integration.py
backend/test_ddos_integration.py
backend/test_dga_integration.py
backend/test_dns_tunnelling_integration.py
backend/test_exfiltration_integration.py
backend/test_malware_tls_integration.py
backend/test_port_scan_integration.py
backend/test_runtime_detector_coverage.py
backend/test_runtime_hardening.py
backend/test_streaming_runtime.py
backend/test_evaluation.py

Run tests:

python -m pytest backend

Runtime Metrics

Metric

Description

Events Received

Total normalized telemetry events received

Events Processed

Events successfully processed

Dropped Events

Events lost during processing

Detector Failures

Detector execution failures

Queue Depth

Current event queue depth

Alerts Generated

Number of generated alerts

Inference Latency

Time spent performing ML inference

End-to-End Latency

Processing-to-alert latency

Processing Throughput

Normalized telemetry events processed per second

Packet Rate vs Event Rate

An important distinction must be made between packet rate and telemetry event rate.

A PCAP may contain:

500 packets/second

but Zeek aggregates packets into higher-level telemetry records.

Therefore:

500 packets/sec

does not necessarily mean:

500 SPECTRA events/sec

SPECTRA performance should report telemetry throughput separately from the original packet rate.

Configuration

Important runtime configuration variables include:

EVENT_QUEUE_MAX_SIZE
RUNNER_SHUTDOWN_TIMEOUT_SECONDS
SUBSCRIBER_QUEUE_MAX_SIZE
ENABLE_MOCK_DETECTOR

Example:

$env:EVENT_QUEUE_MAX_SIZE="1000"
$env:SUBSCRIBER_QUEUE_MAX_SIZE="100"
$env:ENABLE_MOCK_DETECTOR="false"

For demonstration purposes:

$env:SUBSCRIBER_QUEUE_MAX_SIZE="2000"

This does not change the production event-processing queue.

Mock Detector

A mock detector is available for development/testing.

Production operation keeps it disabled:

ENABLE_MOCK_DETECTOR=false

Real deployed detectors should be used for production demonstrations and evaluation.

Machine Learning Artifacts

The ML layer contains detector-specific models and preprocessing artifacts.

Examples include:

DDoS
├── XGBoost model
├── Robust scaler
└── Model metadata

C2
└── Random Forest model

DGA
└── XGBoost model

Port Scan
└── Port-scan model

Malware TLS
└── Streaming malware TLS model

DNS Tunnelling
└── DNS tunnelling model

Large binary model files are managed using Git LFS where configured.

Model Inference

The production runtime performs inference using deployed model artifacts.

Normalized Event
      |
      v
Detector Window
      |
      v
Feature Extraction
      |
      v
Model Input
      |
      v
ML Prediction
      |
      v
Confidence / Score
      |
      v
Detection Threshold
      |
      v
Alert

Training and real-time inference are separate concerns.

Security Considerations

SPECTRA should be deployed inside an appropriate monitoring environment.

Recommended principles:

Read-only telemetry paths

Least-privilege containers

No unnecessary network egress

Isolated monitoring network

No active production-network path

Bounded queues

Controlled resource usage

Input validation

Malformed-event quarantine

Protected model artifacts

Secrets stored outside source control

Fault Tolerance

SPECTRA is designed to tolerate failures at multiple stages.

Input Failure

Malformed telemetry is isolated.

Queue Pressure

Bounded queues prevent unlimited memory growth.

Slow Replay

Replay applies backpressure.

Detector Failure

One detector failure does not terminate the entire runtime.

Client Pressure

WebSocket subscribers use bounded queues to avoid uncontrolled resource consumption.

Shutdown

The runtime supports graceful shutdown.

Limitations

SPECTRA is a detection and monitoring platform rather than a complete prevention system.

It does not inherently provide:

Inline packet blocking

Automatic firewall rule changes

Endpoint remediation

Antivirus functionality

Guaranteed detection of every attack

Guaranteed classification of every encrypted malicious session

Complete payload inspection for every detector

Machine-learning detection quality depends on:

Training data

Model quality

Feature compatibility

Network environment

Threshold configuration

Traffic distribution

Detection results should therefore be treated as security signals and investigated using appropriate operational procedures.

Reproducibility

A network scenario can be captured as a PCAP and processed repeatedly:

PCAP
 |
 v
Zeek
 |
 v
Telemetry
 |
 v
SPECTRA
 |
 v
Detectors
 |
 v
Alerts

This allows developers and evaluators to reproduce the same traffic scenario without requiring a live production network.

Development Workflow

Recommended development workflow:

1. Develop detector/integration
2. Normalize input
3. Implement detector adapter
4. Add feature extraction
5. Add integration tests
6. Test runtime
7. Test replay
8. Test REST API
9. Test WebSocket
10. Test frontend
11. Test Docker deployment
12. Review changes
13. Commit
14. Push

Future Improvements

Potential future improvements include:

Additional threat detectors

Improved model version management

Detector-specific calibration

Better encrypted traffic analytics

QUIC metadata analysis

Advanced C2 validation datasets

Persistent database-backed alert storage

Authentication and authorization

Role-based access control

Advanced alert correlation

Long-term metrics storage

Model drift monitoring

Automated model lifecycle management

Distributed streaming ingestion

Message-broker integration

High-availability deployment

Project Goals

SPECTRA is designed around seven primary goals.

Passive

Monitor traffic without interfering with production systems.

Modular

Allow detectors and ML models to operate independently.

Streaming

Process telemetry continuously.

Explainable

Provide confidence, severity, evidence, and network metadata with alerts.

Reproducible

Support PCAP-based testing and replay.

Resilient

Use bounded queues, failure isolation, and input quarantine.

Deployable

Provide Docker-based deployment for reproducible environments.

Complete Data Flow

                    RAW NETWORK PACKETS
                             |
                             v
                    PASSIVE MIRROR
                             |
                             v
                    MONITORING ENCLAVE
                             |
                             v
                           ZEEK
                             |
              +--------------+--------------+
              v              v              v
           conn.log       dns.log        ssl.log
              |              |              |
              +--------------+--------------+
                             |
                             v
                         INGESTOR
                             |
                             v
                    NORMALIZED EVENTS
                             |
                             v
                       ORCHESTRATOR
                             |
                  +----------+----------+
                  |                     |
                  v                     v
             DETECTOR WINDOWS     FEATURE EXTRACTION
                  |                     |
                  +----------+----------+
                             |
                             v
                       ML INFERENCE
                             |
                             v
                       THRESHOLDING
                             |
                             v
                    SECURITY ALERT
                             |
                  +----------+----------+
                  v                     v
               REST API             WebSocket
                  |                     |
                  +----------+----------+
                             |
                             v
                      SECURITY DASHBOARD

Responsible Use

SPECTRA is intended for:

Authorized network monitoring

Cybersecurity research

Security testing

Educational demonstrations

Critical infrastructure security analysis

Only analyze traffic from systems and networks for which you have appropriate authorization.

Machine-learning predictions are probabilistic and should be validated through appropriate security investigation procedures.

License

See the LICENSE file included in this repository.

Conclusion

SPECTRA provides an end-to-end passive network threat detection pipeline combining:

Passive network monitoring

Zeek telemetry

Event normalization

Streaming orchestration

Detector-specific feature extraction

Machine-learning inference

Standardized security alerts

REST APIs

WebSocket streaming

Real-time visualization

Reproducible PCAP evaluation

Docker deployment

The core architecture can be summarized as:

             PASSIVE NETWORK MONITORING
                        |
                        v
                       ZEEK
                        |
                        v
                   NORMALIZATION
                        |
                        v
                    STREAMING
                        |
                        v
                 THREAT DETECTORS
                        |
                        v
                  ML INFERENCE
                        |
                        v
                STANDARDIZED ALERTS
                        |
               +--------+--------+
               v                 v
             REST            WEBSOCKET
               |                 |
               +--------+--------+
                        |
                        v
                 LIVE DASHBOARD

SPECTRA turns passive network telemetry into real-time, ML-assisted security intelligence while maintaining a read-only monitoring architecture.
