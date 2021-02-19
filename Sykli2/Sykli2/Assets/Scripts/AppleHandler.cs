using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class AppleHandler : MonoBehaviour
{
    // Puolet alueen leveydestä ja pituudesta johon omenoita spawnataan
    public float areaWidth = 2f;
    public float areaHeight = 4f;
    public GameObject apple;

    void Start()
    {
        SpawnApple();
    }

    // Spawnaa omenan random paikkaan alueen sisälle
    public void SpawnApple()
    {
        float posX = Random.Range(-areaWidth, areaWidth);
        float posY = Random.Range(-areaHeight, areaHeight);
        Instantiate(apple, new Vector2(posX, posY), Quaternion.identity);
    }
}
