# Smart House Device Management System

## Overview
The **Smart House Device Management System** is a microservices-based application designed to simplify and enhance smart home management. It offers functionality for user management, device control, device registration, and usage analytics, ensuring a seamless and energy-efficient smart home experience. Each service is independently deployable and scalable, adhering to the principles of microservices architecture.

---

## Core Features

### 1. User Management Service
**Functionalities:**
- **Register a User:** Create a new account with personal details such as name, email, and password.
- **Log In:** Authenticate users and generate secure access tokens for future actions.
- **Update User Details:** Modify account information like email or contact details.
- **Delete Account:** Remove user accounts and all associated data.
- **Log Out:** Invalidate the session securely.

---

### 2. Device Control Service
**Functionalities:**
- **Execute Commands on Devices:** Perform specific operations based on device category:
  - *Climate:* Turn on/off, adjust temperature.
  - *Lighting:* Adjust brightness.
  - *Kitchen:* Operate specific functionalities (e.g., turn on/off appliances).
  - *Entertainment:* Control playback or settings.

---

### 3. Device Registration Service
**Functionalities:**
- **Add a Device:** Register new devices by providing details such as build number, model, watt consumption, and category.
- **View Devices:** Retrieve a list of all registered devices or detailed information about a specific device.
- **Update Device Details:** Modify device attributes like name or wattage.
- **Delete a Device:** Remove devices from the system.

---

### 4. Usage Analytics Service
**Functionalities:**
- **Device Usage Report:** Generate reports for specific devices, including:
  - Total power consumption.
  - Usage time.
  - Peak power usage.
  - Hourly energy consumption for a selected date range.
- **Environmental Footprint Analysis:**
  - Calculate the carbon footprint of devices.
  - Provide recommendations to reduce environmental impact.

---

## Example User Journeys

### Journey 1: Setting Up a Smart Home
1. Register as a new user and log in.
2. Add devices such as a smart thermostat, smart bulbs, and a smart TV.
3. Execute commands like turning on the thermostat or dimming the smart bulbs.

### Journey 2: Monitoring and Optimization
1. Retrieve the usage analytics of a smart thermostat to analyze energy consumption over the past week.
2. Calculate its carbon footprint and get suggestions for reducing it.
3. Update thermostat settings to save energy based on insights.

### Journey 3: Account and Device Management
1. Update account details, such as a new email address.
2. Delete a smart device no longer in use.
3. Log out to end the session securely.

---

## Microservices Architecture

### Key Principles
- **Independent Deployment:** Each service operates independently, allowing updates and scaling without affecting other components.
- **Scalability:** Services can scale individually based on load.
- **Fault Tolerance:** The architecture ensures continuity of unaffected services in case of failures.

### Services Overview
- **User Management Service**
- **Device Control Service**
- **Device Registration Service**
- **Usage Analytics Service**

---

## Deployment

### Dockerized Workflow
The application uses Docker to simplify deployment:
1. Each service is containerized with its dependencies.
2. Docker Compose manages multi-container deployment for local environments.

### Kubernetes Deployment
The application is deployed on a Kubernetes cluster:
- **Independent Deployment:** Each service runs in its own pod.
- **Scaling:** Horizontal Pod Autoscaler manages workload demands.
- **Fault Tolerance:** Kubernetes ensures service reliability and quick recovery.

### Steps
1. Build Docker images for each service:
   ```bash
   docker build -t user-service ./user-service
   docker build -t device-control-service ./device-control-service
   docker build -t device-registration-service ./device-registration-service
   docker build -t usage-analytics-service ./usage-analytics-service
   ```
2. Push images to a container registry:
   ```bash
   docker push <registry>/user-service
   docker push <registry>/device-control-service
   docker push <registry>/device-registration-service
   docker push <registry>/usage-analytics-service
   ```
3. Deploy to Kubernetes using `kubectl`:
   ```bash
   kubectl apply -f k8s/deployment.yaml
   kubectl apply -f k8s/service.yaml
   ```

---

## Tech Stack
- **Backend:** Node.js
- **Database:** MongoDB
- **Containerization:** Docker
- **Orchestration:** Kubernetes
- **Authentication:** JWT

---

## Authors
- Shivang Agarwal
- Ali Abbas Zaidi
- Anant Kumar
- Arjit Ajay Sinha
- Aviral Tiwari

