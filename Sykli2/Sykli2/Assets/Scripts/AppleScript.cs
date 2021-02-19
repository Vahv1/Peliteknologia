using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class AppleScript : MonoBehaviour
{
    public float speedAddition = 0.1f; // Kuinka paljon omenan syöminen nopeuttaa pelaajaa
    private Text pointsText;
    private AppleHandler appleHandlerScript;
    private PlayerScript playerScript;

    private void Start()
    {
        pointsText = GameObject.Find("PointsText").GetComponent<Text>();
        appleHandlerScript = GameObject.Find("AppleHandler").GetComponent<AppleHandler>();
        playerScript = GameObject.Find("Player").GetComponent<PlayerScript>();
    }
    private void OnTriggerEnter2D(Collider2D collision)
    {
        // Pelaajan osuessa omenaan lisätään piste, spawnataan uusi omena ja nopeutetaan pelaajaa
        if (collision.gameObject.tag == "Player")
        {
            appleHandlerScript.SpawnApple();
            playerScript.speed += speedAddition;
            playerScript.points += 1;
            pointsText.text = "Points: " + playerScript.points;
            Destroy(gameObject);
        }
    }
}
