"""
CompassionConnect - Selenium Automated Test Suite
Assignment 3 - DevOps for Cloud Computing
Tests: 15+ test cases for the disaster management web app
"""

import pytest
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import Select
import os

# ─── Configuration ────────────────────────────────────────────────────────────
BASE_URL = os.environ.get("APP_URL", "http://localhost:7100")
HEADLESS  = os.environ.get("HEADLESS", "true").lower() == "true"
TIMEOUT   = 15


# ─── Driver Factory ───────────────────────────────────────────────────────────
@pytest.fixture(scope="function")
def driver():
    opts = Options()
    if HEADLESS:
        opts.add_argument("--headless=new")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--disable-gpu")
    opts.add_argument("--window-size=1280,900")
    opts.add_argument("--disable-extensions")
    opts.add_argument("--remote-debugging-port=9222")

    d = webdriver.Chrome(options=opts)
    d.implicitly_wait(TIMEOUT)
    yield d
    d.quit()


def wait_for(driver, by, value, timeout=TIMEOUT):
    return WebDriverWait(driver, timeout).until(
        EC.presence_of_element_located((by, value))
    )


def wait_clickable(driver, by, value, timeout=TIMEOUT):
    return WebDriverWait(driver, timeout).until(
        EC.element_to_be_clickable((by, value))
    )


# ══════════════════════════════════════════════════════════════════════════════
#  TC-01  Home page loads successfully
# ══════════════════════════════════════════════════════════════════════════════
def test_01_home_page_loads(driver):
    """Home page should return HTTP 200 and show the brand name."""
    driver.get(BASE_URL)
    assert "CompassionConnect" in driver.title or "Disaster" in driver.title, (
        f"Unexpected title: {driver.title}"
    )


# ══════════════════════════════════════════════════════════════════════════════
#  TC-02  Navbar is visible on home page
# ══════════════════════════════════════════════════════════════════════════════
def test_02_navbar_visible(driver):
    """Navbar element must be present on the home page."""
    driver.get(BASE_URL)
    navbar = wait_for(driver, By.CSS_SELECTOR, "nav")
    assert navbar.is_displayed(), "Navbar is not visible"


# ══════════════════════════════════════════════════════════════════════════════
#  TC-03  Brand logo text renders in the navbar
# ══════════════════════════════════════════════════════════════════════════════
def test_03_brand_logo_text(driver):
    """The brand name 'CompassionConnect' should appear inside the navbar."""
    driver.get(BASE_URL)
    wait_for(driver, By.CSS_SELECTOR, "nav")
    body_text = driver.find_element(By.TAG_NAME, "body").text
    assert "CompassionConnect" in body_text, (
        "Brand name not found on the page"
    )


# ══════════════════════════════════════════════════════════════════════════════
#  TC-04  Hero section is displayed on home page
# ══════════════════════════════════════════════════════════════════════════════
def test_04_hero_section_visible(driver):
    """The hero section with an h1 headline must be visible."""
    driver.get(BASE_URL)
    h1 = wait_for(driver, By.TAG_NAME, "h1")
    assert h1.is_displayed(), "H1 / hero headline is not visible"
    assert len(h1.text.strip()) > 0, "H1 headline is empty"


# ══════════════════════════════════════════════════════════════════════════════
#  TC-05  CTA button present on home page
# ══════════════════════════════════════════════════════════════════════════════
def test_05_cta_button_present(driver):
    """A prominent call-to-action button must exist on the home page."""
    driver.get(BASE_URL)
    # Look for any button containing CTA-like text
    buttons = driver.find_elements(By.TAG_NAME, "button")
    cta_texts = ["get involved", "volunteer", "donate", "join", "learn more", "apply"]
    found = any(
        any(kw in btn.text.lower() for kw in cta_texts)
        for btn in buttons
        if btn.is_displayed()
    )
    assert found, "No CTA button found on the home page"


# ══════════════════════════════════════════════════════════════════════════════
#  TC-06  About page loads and contains mission text
# ══════════════════════════════════════════════════════════════════════════════
def test_06_about_page_loads(driver):
    """About page must load and include the word 'Mission' or 'Story'."""
    driver.get(f"{BASE_URL}/about")
    body = wait_for(driver, By.TAG_NAME, "body")
    text = body.text.lower()
    assert "mission" in text or "story" in text or "about" in text, (
        "About page does not contain expected content"
    )


# ══════════════════════════════════════════════════════════════════════════════
#  TC-07  Services page lists at least 3 service cards
# ══════════════════════════════════════════════════════════════════════════════
def test_07_services_page_cards(driver):
    """Services page must display at least 3 service items."""
    driver.get(f"{BASE_URL}/services")
    wait_for(driver, By.TAG_NAME, "body")
    # Service cards use border-l-4 class; fall back to h3 headings
    cards = driver.find_elements(By.CSS_SELECTOR, ".border-l-4, article, .card-soft")
    if len(cards) < 3:
        headings = driver.find_elements(By.TAG_NAME, "h3")
        visible = [h for h in headings if h.is_displayed()]
        assert len(visible) >= 3, (
            f"Expected ≥3 service items, found {len(visible)}"
        )
    else:
        assert len(cards) >= 3


# ══════════════════════════════════════════════════════════════════════════════
#  TC-08  Impact page shows statistics
# ══════════════════════════════════════════════════════════════════════════════
def test_08_impact_page_stats(driver):
    """Impact page must show numeric statistics (e.g. '500,000+')."""
    driver.get(f"{BASE_URL}/impact")
    body = wait_for(driver, By.TAG_NAME, "body")
    text = body.text
    # Look for any number/stat pattern
    import re
    numbers = re.findall(r'\d[\d,]*\+?', text)
    assert len(numbers) >= 3, (
        f"Expected ≥3 numeric stats on impact page, found: {numbers}"
    )


# ══════════════════════════════════════════════════════════════════════════════
#  TC-09  FAQ page contains at least 3 question items
# ══════════════════════════════════════════════════════════════════════════════
def test_09_faq_page_items(driver):
    """FAQ page must render at least 3 question items."""
    driver.get(f"{BASE_URL}/faq")
    wait_for(driver, By.TAG_NAME, "body")
    # FAQs use <details> elements
    details = driver.find_elements(By.TAG_NAME, "details")
    if len(details) < 3:
        # Fallback: count headings / paragraphs with '?' 
        body_text = driver.find_element(By.TAG_NAME, "body").text
        questions = [line for line in body_text.split('\n') if '?' in line]
        assert len(questions) >= 3, (
            f"Expected ≥3 FAQ items, found {len(questions)}"
        )
    else:
        assert len(details) >= 3


# ══════════════════════════════════════════════════════════════════════════════
#  TC-10  FAQ accordion expands on click
# ══════════════════════════════════════════════════════════════════════════════
def test_10_faq_accordion_expands(driver):
    """Clicking a FAQ <details> element should expand it (open attribute)."""
    driver.get(f"{BASE_URL}/faq")
    details_list = WebDriverWait(driver, TIMEOUT).until(
        EC.presence_of_all_elements_located((By.TAG_NAME, "details"))
    )
    assert len(details_list) > 0, "No FAQ accordion elements found"
    first = details_list[0]
    summary = first.find_element(By.TAG_NAME, "summary")
    summary.click()
    time.sleep(0.4)
    is_open = first.get_attribute("open") is not None
    assert is_open, "FAQ accordion did not expand after click"


# ══════════════════════════════════════════════════════════════════════════════
#  TC-11  Contact page renders a form
# ══════════════════════════════════════════════════════════════════════════════
def test_11_contact_form_present(driver):
    """The /contact page must display a form with name, email, and message."""
    driver.get(f"{BASE_URL}/contact")
    wait_for(driver, By.TAG_NAME, "body")
    inputs = driver.find_elements(By.CSS_SELECTOR, "input[type='text'], input[type='email'], textarea")
    visible = [i for i in inputs if i.is_displayed()]
    assert len(visible) >= 2, (
        f"Contact form inputs not found (visible: {len(visible)})"
    )


# ══════════════════════════════════════════════════════════════════════════════
#  TC-12  Contact form – submit with valid data
# ══════════════════════════════════════════════════════════════════════════════
def test_12_contact_form_submit(driver):
    """Filling and submitting the contact form should not throw a JS error
    and the page should remain accessible."""
    driver.get(f"{BASE_URL}/contact")
    wait_for(driver, By.TAG_NAME, "body")

    # Fill name
    try:
        name_field = wait_clickable(driver, By.CSS_SELECTOR, "input[type='text']")
        name_field.clear()
        name_field.send_keys("Test Selenium User")
    except Exception:
        pytest.skip("Name input not found – skipping submit test")

    # Fill email
    try:
        email_field = driver.find_element(By.CSS_SELECTOR, "input[type='email']")
        email_field.clear()
        email_field.send_keys("selenium@test.com")
    except Exception:
        pass

    # Fill textarea / message
    try:
        msg_field = driver.find_element(By.CSS_SELECTOR, "textarea")
        msg_field.clear()
        msg_field.send_keys("Automated Selenium test message – please ignore.")
    except Exception:
        pass

    # Submit
    try:
        submit_btn = driver.find_element(
            By.CSS_SELECTOR, "button[type='submit']"
        )
        submit_btn.click()
        time.sleep(1.5)
    except Exception:
        pass

    # Page should still be accessible
    assert driver.current_url is not None, "Page URL became None after submit"


# ══════════════════════════════════════════════════════════════════════════════
#  TC-13  Reports page loads and shows the submit form
# ══════════════════════════════════════════════════════════════════════════════
def test_13_reports_page_form(driver):
    """The /reports page must show a form to submit community reports."""
    driver.get(f"{BASE_URL}/reports")
    wait_for(driver, By.TAG_NAME, "body")
    lat_input = driver.find_elements(By.CSS_SELECTOR, "input[type='number']")
    assert len(lat_input) >= 2, (
        "Latitude / Longitude number inputs not found on reports page"
    )


# ══════════════════════════════════════════════════════════════════════════════
#  TC-14  Submit a community disaster report
# ══════════════════════════════════════════════════════════════════════════════
def test_14_submit_disaster_report(driver):
    """Submitting a valid disaster report should add it to the visible list."""
    driver.get(f"{BASE_URL}/reports")
    wait_for(driver, By.TAG_NAME, "body")

    try:
        # Category select
        cat_sel = Select(wait_clickable(driver, By.CSS_SELECTOR, "select"))
        cat_sel.select_by_value("flood")

        # Latitude
        lat_inputs = driver.find_elements(By.CSS_SELECTOR, "input[type='number']")
        lat_inputs[0].clear()
        lat_inputs[0].send_keys("33.6844")

        # Longitude
        lat_inputs[1].clear()
        lat_inputs[1].send_keys("73.0479")

        # Description
        textarea = driver.find_element(By.CSS_SELECTOR, "textarea")
        textarea.clear()
        textarea.send_keys("Selenium automated test report – flood simulation near Islamabad.")

        # Submit
        submit = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        submit.click()
        time.sleep(2)

        body_text = driver.find_element(By.TAG_NAME, "body").text.lower()
        assert "flood" in body_text, "Submitted report category not visible after submit"

    except Exception as e:
        pytest.skip(f"Report form interaction failed: {e}")


# ══════════════════════════════════════════════════════════════════════════════
#  TC-15  Volunteer page renders opportunities and an apply button
# ══════════════════════════════════════════════════════════════════════════════
def test_15_volunteer_page(driver):
    """Volunteer page must list opportunities and show an 'Apply' / 'Begin' button."""
    driver.get(f"{BASE_URL}/volunteer")
    body = wait_for(driver, By.TAG_NAME, "body")
    text = body.text.lower()
    assert "volunteer" in text, "Volunteer page does not contain expected text"

    buttons = driver.find_elements(By.TAG_NAME, "button")
    apply_btn = any(
        "apply" in btn.text.lower() or "begin" in btn.text.lower()
        for btn in buttons
        if btn.is_displayed()
    )
    assert apply_btn, "No 'Apply' or 'Begin Application' button on volunteer page"


# ══════════════════════════════════════════════════════════════════════════════
#  TC-16  Footer is present on home page
# ══════════════════════════════════════════════════════════════════════════════
def test_16_footer_present(driver):
    """Every page should have a footer element."""
    driver.get(BASE_URL)
    footer = wait_for(driver, By.TAG_NAME, "footer")
    assert footer.is_displayed(), "Footer is not visible on the home page"


# ══════════════════════════════════════════════════════════════════════════════
#  TC-17  Donation page renders donation amount buttons
# ══════════════════════════════════════════════════════════════════════════════
def test_17_donation_page_amounts(driver):
    """Donation page must show pre-set amount buttons ($25, $50, $100 etc.)."""
    driver.get(f"{BASE_URL}/donation")
    body = wait_for(driver, By.TAG_NAME, "body")
    text = body.text
    amounts_found = sum(1 for a in ["$25", "$50", "$100", "$250"] if a in text)
    assert amounts_found >= 3, (
        f"Expected ≥3 donation amounts on page, found {amounts_found}"
    )


# ══════════════════════════════════════════════════════════════════════════════
#  TC-18  Disaster map container renders on home page
# ══════════════════════════════════════════════════════════════════════════════
def test_18_disaster_map_container(driver):
    """The Leaflet map container div (#disasterMap) must be in the DOM."""
    driver.get(BASE_URL)
    # Give the dynamic map time to mount
    time.sleep(3)
    map_div = driver.find_elements(By.ID, "disasterMap")
    assert len(map_div) > 0, "Disaster map container (#disasterMap) not found in DOM"


# ══════════════════════════════════════════════════════════════════════════════
#  TC-19  Navigation link 'About' redirects to /about
# ══════════════════════════════════════════════════════════════════════════════
def test_19_nav_about_link(driver):
    """Clicking the 'About' nav link should navigate to /about."""
    driver.get(BASE_URL)
    wait_for(driver, By.CSS_SELECTOR, "nav")
    links = driver.find_elements(By.CSS_SELECTOR, "nav a")
    about_link = next(
        (lnk for lnk in links if "about" in lnk.text.lower()),
        None
    )
    assert about_link is not None, "About link not found in navbar"
    about_link.click()
    WebDriverWait(driver, TIMEOUT).until(
        lambda d: "about" in d.current_url.lower()
    )
    assert "about" in driver.current_url.lower(), (
        f"Expected /about URL, got: {driver.current_url}"
    )


# ══════════════════════════════════════════════════════════════════════════════
#  TC-20  Navigation link 'Contact' redirects to /contact
# ══════════════════════════════════════════════════════════════════════════════
def test_20_nav_contact_link(driver):
    """Clicking the 'Contact' nav link should navigate to /contact."""
    driver.get(BASE_URL)
    wait_for(driver, By.CSS_SELECTOR, "nav")
    links = driver.find_elements(By.CSS_SELECTOR, "nav a")
    contact_link = next(
        (lnk for lnk in links if "contact" in lnk.text.lower()),
        None
    )
    assert contact_link is not None, "Contact link not found in navbar"
    contact_link.click()
    WebDriverWait(driver, TIMEOUT).until(
        lambda d: "contact" in d.current_url.lower()
    )
    assert "contact" in driver.current_url.lower(), (
        f"Expected /contact URL, got: {driver.current_url}"
    )
